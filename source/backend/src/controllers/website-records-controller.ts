import { MongoClient, ObjectId } from 'mongodb';
import { getWebsiteRecordsCollection } from '../db-access';
import { WebsiteRecord, StoredWebsiteRecord } from '../website-record';
import { IdEntity } from '../base-types';

export function createWebsiteRecordController(mongoClient: MongoClient) {
    const recordsCollection = getWebsiteRecordsCollection(mongoClient);

    async function getWebsiteRecords(): Promise<WebsiteRecord & IdEntity[]> {
        const records = await recordsCollection.find().project({ executions: 0 }).toArray();
        return records as WebsiteRecord & IdEntity[];
    }

    async function addWebsiteRecord(websiteRecord: WebsiteRecord): Promise<string | undefined> {
        const storageRecord: StoredWebsiteRecord = { ...websiteRecord, executions: [] };
        const insertedDoc = await recordsCollection.insertOne(storageRecord as any);
        return insertedDoc.acknowledged ? insertedDoc.insertedId.toHexString() : undefined;
    }

    async function deleteAllWebsiteRecords(): Promise<boolean> {
        const result = await recordsCollection.deleteMany({});
        return result.acknowledged;
    }

    async function getWebsiteRecord(websiteRecordId: string): Promise<WebsiteRecord | null> {
        const websiteRecord = await recordsCollection.findOne({ _id: new ObjectId(websiteRecordId) });
        return websiteRecord as WebsiteRecord | null;
    }

    async function updateWebsiteRecord(websiteRecordId: string, websiteRecord: WebsiteRecord): Promise<boolean> {
        const updateResult = await recordsCollection.updateOne({ _id: new ObjectId(websiteRecordId) }, websiteRecord, { upsert: true });
        return updateResult.matchedCount > 0;
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
