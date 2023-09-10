import { Collection, MongoClient } from 'mongodb';

const dbName = 'crawler';
const websiteRecordsCollectionName = 'website-records';
const crawledWebsites = 'crawled-websites';

export function getWebsiteRecordsCollection(client: MongoClient): Collection<Document> {
    const db = client.db(dbName);
    return db.collection(websiteRecordsCollectionName);
}

export function getCrawlExecutionsCollection(client: MongoClient): Collection<Document> {
    const db = client.db(dbName);
    return db.collection(crawledWebsites);
}

export function getCrawledWebsitesCollection(client: MongoClient): Collection<Document> {
    const db = client.db(dbName);
    return db.collection(crawledWebsites);
}
