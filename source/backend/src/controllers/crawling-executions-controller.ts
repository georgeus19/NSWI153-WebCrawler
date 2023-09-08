import { MongoClient, ObjectId } from 'mongodb';
import { getWebsiteRecordsCollection } from './../db-access';
import { FinishedCrawlingExecution, RunningCrawlingExecution } from '../crawling-executor/crawling-execution';

export function createExecutionController(mongoClient: MongoClient) {
    const recordsCollection = getWebsiteRecordsCollection(mongoClient);

    async function addExecution(websiteRecordId: string): Promise<string | undefined> {
        const executionId = new ObjectId();
        const updateResult = await recordsCollection.updateOne(
            { _id: new ObjectId(websiteRecordId) },
            {
                $push: {
                    executions: {
                        id: executionId,
                        status: 'running',
                    },
                },
            }
        );

        if (updateResult.matchedCount > 0) {
            return executionId.toHexString();
        } else {
            return undefined;
        }
    }

    async function getExecutions(websiteRecordId?: string): Promise<(FinishedCrawlingExecution | RunningCrawlingExecution)[]> {
        const pipeline = [];
        if (websiteRecordId) {
            pipeline.push({ $match: { _id: new ObjectId(websiteRecordId) } });
        }
        pipeline.push({ $project: { _id: 0, executions: 1 } });
        pipeline.push({ $unwind: '$executions' });
        pipeline.push({ $replaceWith: '$executions' });
        const executions = await recordsCollection
            .aggregate(pipeline)
            .map((doc) => {
                doc.id = doc._id;
                return doc;
            })
            .toArray();
        return executions as (FinishedCrawlingExecution | RunningCrawlingExecution)[];
    }

    async function getExecution(websiteRecordId: string, executionId: string): Promise<FinishedCrawlingExecution | RunningCrawlingExecution | null> {
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
        return execution as FinishedCrawlingExecution | RunningCrawlingExecution | null;
    }

    return {
        getExecutions,
        addExecution,
        getExecution,
    };
}
