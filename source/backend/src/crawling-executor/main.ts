import { v4 as uuidv4 } from 'uuid';
import workerpool from 'workerpool';
import { getWebsiteRecordsCollection } from '../shared/db-access';
import { MongoClient } from 'mongodb';

const mongoUri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.5';
const mongoClient = new MongoClient(mongoUri);
const recordsCollection = getWebsiteRecordsCollection(mongoClient);
const changeStream = recordsCollection.watch([]);
changeStream.on('change', (next) => {
    console.log(next);
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
