import { MongoClient, ObjectId } from 'mongodb';
import { getWebsiteRecordsCollection } from './../db-access';
import {
    CrawlingExecutionWithWebsiteRecordId,
    FinishedCrawlingExecution,
    RunningCrawlingExecution,
    createNewRunningExecution,
} from '../crawling-executor/crawling-execution';
import { IdEntity } from '../base-types';

export function createExecutionController(mongoClient: MongoClient) {
    const recordsCollection = getWebsiteRecordsCollection(mongoClient);

    async function addExecution(websiteRecordId: string): Promise<string | undefined> {
        const execution = createNewRunningExecution(new ObjectId().toHexString());
        const updateResult = await recordsCollection.updateOne(
            { _id: new ObjectId(websiteRecordId) },
            {
                $push: {
                    executions: execution,
                },
            }
        );

        if (updateResult.matchedCount > 0) {
            return execution.id;
        } else {
            return undefined;
        }
    }

    async function getExecutions(websiteRecordId?: string): Promise<(CrawlingExecutionWithWebsiteRecordId & IdEntity)[]> {
        const pipeline = [];
        if (websiteRecordId) {
            pipeline.push({ $match: { _id: new ObjectId(websiteRecordId) } });
        }
        pipeline.push({ $project: { _id: 1, executions: 1 } });
        pipeline.push({ $unwind: '$executions' });
        pipeline.push({ $replaceWith: { $mergeObjects: ['$$ROOT', '$executions'] } });
        pipeline.push({ $project: { executions: 0 } });
        const executions = await recordsCollection
            .aggregate(pipeline)
            .map((doc) => {
                doc.websiteRecordId = doc._id;
                return doc;
            })
            .toArray();
        return executions as (CrawlingExecutionWithWebsiteRecordId & IdEntity)[];
    }

    async function getExecution(websiteRecordId: string, executionId: string): Promise<CrawlingExecutionWithWebsiteRecordId | null> {
        const execution = await recordsCollection
            .aggregate([
                {
                    $match: {
                        _id: new ObjectId(websiteRecordId),
                        executions: {
                            $elemMatch: {
                                id: new ObjectId(executionId),
                            },
                        },
                    },
                },
                { $project: { _id: 0, executions: 1 } },
                { $unwind: '$executions' },
                { $replaceWith: '$executions' },
                { $match: { id: new ObjectId(executionId) } },
            ])
            .next();
        return execution as CrawlingExecutionWithWebsiteRecordId | null;
    }

    return {
        getExecutions,
        addExecution,
        getExecution,
    };
}
