import express from 'express';
import { MongoClient } from 'mongodb';
import { addWebsiteRecordsApi } from './api/website-records';
import bodyParser from 'body-parser';
import { addCrawlExecutionsApi } from './api/crawl-executions';
import { createCrawlingExecutor } from './crawling-executor/executor';
import { SortedMap } from '@rimbu/core';
import { SortedSet } from '@rimbu/sorted';
import BTree from 'sorted-btree';
import { Heap } from 'heap-js';
import { Redis } from 'ioredis';

const mongoUri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.5';
const mongoClient = new MongoClient(mongoUri);
const app = express();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());

const executor = createCrawlingExecutor(mongoClient, { port: 6379, host: '127.0.0.1' });
addWebsiteRecordsApi(app, mongoClient, executor);
addCrawlExecutionsApi(app, mongoClient, executor);

executor.start();

app.listen(3000, () => {
    console.log('App listening on port 3000');
});
// let websiteRecordExecutionSchedule = SortedMap.empty<string, number>();
// websiteRecordExecutionSchedule = websiteRecordExecutionSchedule.addEntry(['aahoj', 3]);
// websiteRecordExecutionSchedule = websiteRecordExecutionSchedule.addEntry(['test', 4]);
// websiteRecordExecutionSchedule = websiteRecordExecutionSchedule.addEntry(['ahoj', 2]);
// console.log(websiteRecordExecutionSchedule.min());
// console.log(websiteRecordExecutionSchedule.min());
interface XX {
    ts: number;
    id: string;
}
// let tree = new BTree(undefined, (a, b) => {
//     if (a.score > b.score) {
//         return 1;
//     } else if (a.score < b.score) {
//         return -1;
//     } else {
//         return 0;
//     }
// });

const heap = new Heap((a: XX, b: XX) => a.ts - b.ts);
heap.push({ ts: 22324, id: 'id1' });
heap.push({ ts: 3223, id: 'id1' });
heap.push({ ts: 2, id: 'id1' });
heap.push({ ts: 2332, id: 'id1' });
heap.push({ ts: 323333, id: 'id1' });
console.log(heap.peek());
console.log(heap.pop());
console.log(heap.peek());
console.log(heap.pop());
console.log(heap.peek());
console.log(heap.pop());
console.log(heap.peek());
console.log(heap.pop());
// const exe = createCrawlingExecutor();
// exe.runExecution();
