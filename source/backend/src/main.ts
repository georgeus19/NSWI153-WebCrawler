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


// import { v4 as uuidv4 } from 'uuid';
// import workerpool from 'workerpool';
// async function main() {
//     const pool = workerpool.pool(__dirname + '/execution-worker.js');
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