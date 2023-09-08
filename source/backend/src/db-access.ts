import { Collection, MongoClient } from 'mongodb';

const dbName = 'crawler';
const websiteRecordsCollectionName = 'website-records';
const crawlExecutionsCollectionName = 'crawl-executions';

export function getWebsiteRecordsCollection(client: MongoClient): Collection<Document> {
    const db = client.db(dbName);
    return db.collection(websiteRecordsCollectionName);
}

export function getCrawlExecutionsCollection(client: MongoClient): Collection<Document> {
    const db = client.db(dbName);
    return db.collection(crawlExecutionsCollectionName);
}
