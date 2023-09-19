import { MongoClient, ObjectId } from 'mongodb';
import { getWebsiteRecordsCollection } from '../db-access';
import {
    WebsiteRecord,
    StoredWebsiteRecord,
    WebsiteRecordFilterParams,
    WebsiteRecordWithLastExecution,
    WebsiteRecordParams,
    PagedResults,
} from '../website-record';
import { IdEntity } from '../base-types';
import { createNewRunningExecution } from '../crawling-executor/crawling-execution';
import { CrawlingExecutor } from '../crawling-executor/executor';

export function createWebsiteRecordController(mongoClient: MongoClient, crawlingExecutor: CrawlingExecutor) {
    const recordsCollection = getWebsiteRecordsCollection(mongoClient);

    async function getWebsiteRecords(params: WebsiteRecordParams): Promise<PagedResults<(WebsiteRecordWithLastExecution & IdEntity)[]>> {
        const filter: Record<string, any> = {};
        if (params.filter) {
            if (params.filter.label) {
                filter.label = { $regex: params.filter.label, $options: 'i' };
            }
            if (params.filter.url) {
                filter.url = { $regex: params.filter.url, $options: 'i' };
            }
            if (params.filter.tags) {
                filter.tags = { $all: params.filter.tags };
            }
        }
        const recordCount = await recordsCollection.countDocuments(filter);
        let querySpecification = recordsCollection.find(filter);
        console.log(recordCount);
        console.log(params.pagination);
        if (params.pagination) {
            querySpecification = querySpecification.skip(params.pagination.skip).limit(params.pagination.limit);
        }

        const records = await querySpecification
            .project({ executions: 0 })
            .map((record) => {
                record.id = record._id;
                delete record._id;
                return record;
            })
            .toArray();
        // const records = await .sort({}).skip(params.pagination.skip).limit(params.pagination.limit)..toArray();
        return { data: records as unknown as (WebsiteRecordWithLastExecution & IdEntity)[], pagination: { length: recordCount } };
    }

    async function addWebsiteRecord(websiteRecord: WebsiteRecord): Promise<string | undefined> {
        const storageRecord: StoredWebsiteRecord = {
            ...websiteRecord,
            executions: [createNewRunningExecution(new ObjectId().toHexString())],
        };
        const insertedDoc = await recordsCollection.insertOne(storageRecord as any);
        const websiteRecordId = insertedDoc.acknowledged ? insertedDoc.insertedId.toHexString() : undefined;
        if (websiteRecordId && websiteRecord.active) {
            crawlingExecutor.addExecution(websiteRecordId, storageRecord.executions[0].id);
        }
        return websiteRecordId;
    }

    async function deleteAllWebsiteRecords(): Promise<boolean> {
        const result = await recordsCollection.deleteMany({});
        return result.acknowledged;
    }

    async function getWebsiteRecord(websiteRecordId: string): Promise<WebsiteRecordWithLastExecution | null> {
        const websiteRecord = await recordsCollection.findOne({ _id: new ObjectId(websiteRecordId) }, { projection: { executions: 0 } });
        return websiteRecord as WebsiteRecordWithLastExecution | null;
    }

    async function updateWebsiteRecord(
        websiteRecordId: string,
        websiteRecord: WebsiteRecord
    ): Promise<(WebsiteRecordWithLastExecution & IdEntity) | null> {
        const storedWebsiteRecord = (await recordsCollection.findOne({ _id: new ObjectId(websiteRecordId) })) as StoredWebsiteRecord | null;
        if (storedWebsiteRecord) {
            const differentUrl: boolean = storedWebsiteRecord.url !== websiteRecord.url;
            const differentRegExp: boolean = storedWebsiteRecord.boundaryRegExp !== websiteRecord.boundaryRegExp;
            const differentActivity: boolean = storedWebsiteRecord.active !== websiteRecord.active;
            const differentPeriodicity: boolean = storedWebsiteRecord.periodicity !== websiteRecord.periodicity;
            const runNewExecution = websiteRecord.active || differentUrl || differentRegExp || differentActivity || differentPeriodicity;

            const websiteRecordToAdd: StoredWebsiteRecord = { ...websiteRecord, executions: storedWebsiteRecord.executions };
            const executionId = new ObjectId().toHexString();
            if (runNewExecution) {
                websiteRecordToAdd.executions.push(createNewRunningExecution(executionId));
            }
            const updateResult = await recordsCollection.updateOne({ _id: new ObjectId(websiteRecordId) }, { $set: websiteRecord }, { upsert: true });
            const updated = updateResult.matchedCount > 0;

            if (updated && runNewExecution) {
                crawlingExecutor.addExecution(websiteRecordId, executionId);
            }
            const updatedRecord: any = websiteRecordToAdd;
            delete updatedRecord.executions;
            updatedRecord.id = websiteRecordId;

            return updatedRecord;
        }

        return null;
    }

    async function deleteWebsiteRecord(websiteRecordId: string): Promise<boolean> {
        const result = await recordsCollection.deleteOne({ _id: new ObjectId(websiteRecordId) });
        return result.deletedCount == 1;
    }

    return {
        getWebsiteRecords,
        addWebsiteRecord,
        deleteAllWebsiteRecords,
        getWebsiteRecord,
        updateWebsiteRecord,
        deleteWebsiteRecord,
    };
}
