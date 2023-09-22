import { v4 as uuidv4 } from 'uuid';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import workerpool from 'workerpool';
import { StoredWebsiteRecord, WebsiteRecord, WebsiteRecordWithLastExecution } from '../website-record';
import { Redis, RedisOptions } from 'ioredis';
import { CrawlingExecution, FinishedCrawlingExecution, RunningCrawlingExecution, createNewRunningExecution } from './crawling-execution';
import { getCrawledWebsitesCollection, getWebsiteRecordsCollection } from '../db-access';
import { SortedSet } from '@rimbu/sorted';
import { SortedMap } from '@rimbu/core';
import { Heap } from 'heap-js';
import { IdEntity } from '../base-types';

type PendingExecution = WebsiteRecord & { executionId: string };

interface ScheduledExecution {
    scheduledStartTime: Date;
    executionId: string;
    websiteRecordId: string;
}

export interface CrawlingExecutor {
    addExecution: (websiteRecordId: string, executionId: string) => void;
    cancelExecution: (executionId: string) => void;
    start: () => void;
}

export function createCrawlingExecutor(mongoClient: MongoClient, redisOptions: RedisOptions): CrawlingExecutor {
    const pool = workerpool.pool(__dirname + '/execution-worker.js');

    const redis = new Redis(redisOptions);
    const executionQueue = new Heap(
        (a: ScheduledExecution, b: ScheduledExecution) => a.scheduledStartTime.getTime() - b.scheduledStartTime.getTime()
    );
    const lastStartedExecutions = new Map<string, string>();
    const runningExecutions = new Map<string, string>();
    const cancelledExecutions = new Set<string>();
    const lastAddedExecutions = new Map<string, string>();

    async function addExecution(websiteRecordId: string, executionId: string) {
        executionQueue.add({ scheduledStartTime: new Date(Date.now()), executionId: executionId, websiteRecordId: websiteRecordId });
        lastAddedExecutions.set(websiteRecordId, executionId);
    }

    function cancelExecution(executionId: string) {
        executionQueue.remove(
            { executionId: executionId, scheduledStartTime: new Date(), websiteRecordId: '' },
            (e, o) => e.executionId == o.executionId
        );
    }

    async function startRunningExecutionIfNotStarted(executionId: string, websiteRecord: WebsiteRecordWithLastExecution & IdEntity) {
        const recordsCollection = getWebsiteRecordsCollection(mongoClient);

        if (!websiteRecord.lastExecution || websiteRecord.lastExecution.id === executionId) {
            return;
        }

        const execution: RunningCrawlingExecution & IdEntity = createNewRunningExecution(executionId);
        const updateResult = await recordsCollection.updateOne(
            { _id: new ObjectId(websiteRecord.id) },
            {
                $push: {
                    executions: execution,
                },
                $set: {
                    lastExecution: execution,
                },
            }
        );
        console.log('startRunningExecutionIfNotStarted', updateResult);
    }

    async function runExecution(executionId: string, websiteRecord: WebsiteRecordWithLastExecution & IdEntity) {
        lastStartedExecutions.set(websiteRecord.id, executionId);
        const runningExecutionId = runningExecutions.get(websiteRecord.id);
        await startRunningExecutionIfNotStarted(executionId, websiteRecord);
        if (runningExecutionId) {
            await redis.del(runningExecutionId);
        }
        runningExecutions.set(websiteRecord.id, executionId);

        const execution = (await pool.exec('runCrawlingExecution', [
            {
                executionId: executionId,
                url: websiteRecord.url,
                boundaryRegexp: websiteRecord.boundaryRegExp,
                redisOptions: redisOptions,
            },
        ])) as FinishedCrawlingExecution;
        if (runningExecutions.get(websiteRecord.id) == executionId) {
            runningExecutions.delete(websiteRecord.id);
        }
        const recordsCollection = getWebsiteRecordsCollection(mongoClient);
        if (execution.status === 'finished') {
            const crawledSites = await redis.zrange(executionId, 0, -1);
            const crawledWebsitesCollection = getCrawledWebsitesCollection(mongoClient);
            const session = mongoClient.startSession();
            try {
                session.startTransaction({
                    readConcern: { level: 'snapshot' },
                    writeConcern: { w: 'majority' },
                    readPreference: 'primary',
                });
                await crawledWebsitesCollection.deleteMany({ websiteRecordId: websiteRecord.id });
                const insertResult = await crawledWebsitesCollection.insertMany(
                    crawledSites.map((crawledSite) => {
                        return { executionId: executionId, websiteRecordId: websiteRecord.id, ...JSON.parse(crawledSite) };
                    })
                );
                // console.log('executionId', executionId);
                const updateResult = await updateExecution(recordsCollection, { ...execution, id: executionId }, websiteRecord);
                console.log('UPDATE RESULT', updateResult);

                if (updateResult.matchedCount > 0 && insertResult.insertedCount == crawledSites.length) {
                    // console.log('successful save');
                    // console.log(updateResult, insertResult);
                    await session.commitTransaction();
                } else {
                    await session.abortTransaction();
                }
            } catch (error) {
                console.log(error);
                await session.abortTransaction();
            } finally {
                await session.endSession();
            }
        } else {
            updateExecution(recordsCollection, { ...execution, id: executionId }, websiteRecord);
        }
        await redis.del(executionId);
        if (execution.status !== 'cancelled') {
            const newExecutionId = new ObjectId().toHexString();
            executionQueue.add({
                scheduledStartTime: new Date(execution.end.getTime() + websiteRecord.periodicity),
                executionId: newExecutionId,
                websiteRecordId: websiteRecord.id,
            });
            lastAddedExecutions.set(websiteRecord.id, newExecutionId);
        }

        console.log('execution return', execution);
    }

    function updateExecution(
        recordsCollection: Collection<Document>,
        execution: CrawlingExecution & IdEntity,
        websiteRecord: WebsiteRecord & IdEntity
    ) {
        return recordsCollection.updateOne(
            { _id: new ObjectId(websiteRecord.id), 'executions.id': execution.id },
            {
                $set: {
                    'executions.$': execution,
                    lastExecution: execution,
                },
            }
        );
    }

    async function runScheduledExecution() {
        try {
            const recordsCollection = getWebsiteRecordsCollection(mongoClient);
            let firstExecution = executionQueue.peek();
            while (firstExecution && firstExecution.scheduledStartTime < new Date(Date.now())) {
                const websiteRecord = (await recordsCollection.findOne(
                    { _id: new ObjectId(firstExecution.websiteRecordId) },
                    { projection: { executions: 0 } }
                )) as WebsiteRecordWithLastExecution | null;
                if (websiteRecord) {
                    console.log('XXXXXXXXXXXXXXXX', firstExecution.executionId);
                    runExecution(firstExecution.executionId, { id: firstExecution.websiteRecordId, ...websiteRecord });
                }
                executionQueue.pop();
                firstExecution = executionQueue.peek();
            }
        } catch (error) {
            console.log(error);
        }
    }

    function start() {
        setInterval(runScheduledExecution, 300);
    }

    return {
        addExecution,
        cancelExecution,
        start,
    };
}
