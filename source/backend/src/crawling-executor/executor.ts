import { v4 as uuidv4 } from 'uuid';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import workerpool from 'workerpool';
import { StoredWebsiteRecord, WebsiteRecord } from '../website-record';
import { Redis, RedisOptions } from 'ioredis';
import { FinishedCrawlingExecution } from './crawling-execution';
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

export function createCrawlingExecutor(mongoClient: MongoClient, redis: Redis): CrawlingExecutor {
    const pool = workerpool.pool(__dirname + '/execution-worker.js');

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

    async function runExecution(executionId: string, websiteRecord: WebsiteRecord & IdEntity) {
        lastStartedExecutions.set(websiteRecord.id, executionId);
        const runningExecutionId = runningExecutions.get(websiteRecord.id);
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
            const crawledSites = await redis.zrange(executionId, '-inf', '+inf');
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

                const updateResult = await recordsCollection.updateOne(
                    { _id: new ObjectId(websiteRecord.id) },
                    {
                        $set: {
                            'executions.$[element]': {
                                id: new ObjectId(executionId),
                                ...execution,
                            },
                        },
                    },
                    { arrayFilters: [{ element: { id: new ObjectId(executionId) } }] }
                );

                if (updateResult.matchedCount > 0 && insertResult.insertedCount == crawledSites.length) {
                    await session.commitTransaction();
                } else {
                    await session.abortTransaction();
                }
            } catch (error) {
                await session.abortTransaction();
            } finally {
                await session.endSession();
            }
        } else {
            await recordsCollection.updateOne(
                { _id: new ObjectId(websiteRecord.id) },
                {
                    $set: {
                        'executions.$[element]': {
                            id: new ObjectId(executionId),
                            ...execution,
                        },
                    },
                },
                { arrayFilters: [{ element: { id: new ObjectId(executionId) } }] }
            );
        }
        await redis.del(executionId);

        console.log('execution return', execution);
    }

    async function runScheduledExecution() {
        const recordsCollection = getWebsiteRecordsCollection(mongoClient);
        let firstExecution = executionQueue.peek();
        while (firstExecution && firstExecution.scheduledStartTime < new Date(Date.now())) {
            const websiteRecord = (await recordsCollection.findOne(
                { _id: new ObjectId(firstExecution.websiteRecordId) },
                { projection: { executions: 0 } }
            )) as WebsiteRecord | null;
            if (websiteRecord) {
                runExecution(firstExecution.executionId, { id: firstExecution.websiteRecordId, ...websiteRecord });
            }
            executionQueue.pop();
            firstExecution = executionQueue.peek();
        }
    }

    function start() {
        setInterval(runScheduledExecution, 1000);
    }

    // pool.terminate();

    return {
        addExecution,
        cancelExecution,
        start,
    };
}

// const x = await pool.exec('runCrawlingExecution', [
//     {
//         executionId: 'executionCrawlRecords-' + uuidv4(),
//         url: 'https://www.zelezarstvizizkov.cz/',
//         boundaryRegexp: '^http.*',
//         redisOptions: redisOptions,
//     },
// ]);

// await recordsCollection.find().filter({executions: {status: 'finished'}}).sort({'executions.endTime': -1}).limit(1).project().next();

// const lastFinishedExecution = await recordsCollection
//     .aggregate([
//         {
//             $match: {
//                 _id: new ObjectId(websiteRecordId),
//             },
//         },
//         { $project: { _id: 0, executions: 1 } },
//         { $unwind: '$executions' },
//         { $replaceWith: '$executions' },
//         { $filter: { status: 'finished' } },
//         { $group: { _id: null, lastFinishedExecution: { $max: '$endTime' } } },
//     ])
//     .next();
// websiteRecord.executions = websiteRecord.executions.filter(e => e.).sort((a, b) => {
//     if (a.status === 'finished' && b.status !== 'finished') {
//         return -1;
//     }

//     if (a.status !== 'finished' && b.status === 'finished') {
//         return 1;
//     }

//     if (a.status === 'finished' && b.status === 'finished') {
//         return new Date(a.end).getTime() - new Date(b.end).getTime();
//     }

//     return 0;
// });
// if (websiteRecord.executions.length > 0) {
//     websiteRecord.executions[0];
// }
