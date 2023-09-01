import { Worker } from 'worker_threads';
import { v4 as uuidv4 } from 'uuid';
import process from 'process';
import workerpool from 'workerpool';
import express from 'express';
import { MongoClient } from 'mongodb';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { addWebsiteRecordsApi } from './api/website-records';
import bodyParser from 'body-parser';

interface WebsiteRecord {
    id: string;
    url: string;
    boundaryRegExp: string;
    periodicity: number;
    label: string;
    active: boolean;
    tags: string[];
}

const mongoUri = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUri);
const app = express();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());

addWebsiteRecordsApi(app, mongoClient);

app.listen(3000, () => {
    console.log('App listening on port 3000');
});
// async function main() {
//     const pool = workerpool.pool(__dirname + '/executor.js');
//     await pool.exec('runCrawlingExecution', [
//         {
//             executionId: 'executionCrawlRecords-' + uuidv4(),
//             url: 'https://www.zelezarstvizizkov.cz/',
//             boundaryRegexp: '^http.*',
//             redisOptions: 6379,
//         },
//     ]);

//     pool.terminate();
// }

// main();
