import express from 'express';
import { MongoClient } from 'mongodb';
import { addWebsiteRecordsApi } from './api/website-records';
import bodyParser from 'body-parser';
import { addCrawlExecutionsApi } from './api/crawl-executions';

const mongoUri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.5';
const mongoClient = new MongoClient(mongoUri);
const app = express();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());

addWebsiteRecordsApi(app, mongoClient);
addCrawlExecutionsApi(app, mongoClient);

app.listen(3000, () => {
    console.log('App listening on port 3000');
});
