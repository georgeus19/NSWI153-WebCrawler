import { Collection, MongoClient } from 'mongodb';

const dbName = 'crawler';
const websiteRecordsCollectionName = 'website-records';

export function getWebsiteRecordsCollection(client: MongoClient): Collection<Document> {
    const db = client.db(dbName);
    return db.collection(websiteRecordsCollectionName);
}
