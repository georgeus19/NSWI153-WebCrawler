import { MongoClient, ObjectId } from 'mongodb';
import { getWebsiteRecordsCollection } from '../db-access';
import { WebsiteRecord, StoredWebsiteRecord } from '../website-record';
import { IdEntity } from '../base-types';
import { createNewRunningExecution } from '../crawling-executor/crawling-execution';
import { CrawlingExecutor } from '../crawling-executor/executor';

export function createWebsiteRecordController(mongoClient: MongoClient, crawlingExecutor: CrawlingExecutor) {
    const recordsCollection = getWebsiteRecordsCollection(mongoClient);

    async function getWebsiteRecords(): Promise<WebsiteRecord & IdEntity[]> {
        const records = await recordsCollection.find().project({ executions: 0 }).toArray();
        return records as WebsiteRecord & IdEntity[];
    }

    async function addWebsiteRecord(websiteRecord: WebsiteRecord): Promise<string | undefined> {
        const storageRecord: StoredWebsiteRecord = {
            ...websiteRecord,
            executions: [createNewRunningExecution(new ObjectId().toHexString())],
        };
        const insertedDoc = await recordsCollection.insertOne(storageRecord as any);
        const websiteRecordId = insertedDoc.acknowledged ? insertedDoc.insertedId.toHexString() : undefined;
        if (websiteRecordId) {
            crawlingExecutor.addExecution(websiteRecordId, storageRecord.executions[0].id);
        }
        return websiteRecordId;
    }

    async function deleteAllWebsiteRecords(): Promise<boolean> {
        const result = await recordsCollection.deleteMany({});
        return result.acknowledged;
    }

    async function getWebsiteRecord(websiteRecordId: string): Promise<WebsiteRecord | null> {
        const websiteRecord = await recordsCollection.findOne({ _id: new ObjectId(websiteRecordId) }, { projection: { executions: 0 } });
        return websiteRecord as WebsiteRecord | null;
    }

    async function updateWebsiteRecord(websiteRecordId: string, websiteRecord: WebsiteRecord): Promise<boolean> {
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
            const updateResult = await recordsCollection.updateOne({ _id: new ObjectId(websiteRecordId) }, websiteRecord, { upsert: true });
            const updated = updateResult.matchedCount > 0;

            if (updated && runNewExecution) {
                crawlingExecutor.addExecution(websiteRecordId, executionId);
            }
            return updated;
        }

        return false;
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
