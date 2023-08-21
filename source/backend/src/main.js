const crawling = require('./crawling');
const { Worker } = require('worker_threads');
const { v4: uuidv4 } = require('uuid');
const process = require('process');


// const worker = new Worker(
//     __dirname + '/crawler.js',
//     {
        // workerData: {
        //     executionId: 'executionCrawlRecords-' + uuidv4(),
        //     url: 'https://www.zelezarstvizizkov.cz/',
        //     boundaryRegexp: new RegExp('^http.*'),
        //     redisOptions: 6379
        // }

//     }
// );

const workerpool = require('workerpool');

const pool = workerpool.pool(__dirname + '/executor.js');
pool.exec('runCrawlingExecution', {
    executionId: 'executionCrawlRecords-' + uuidv4(),
    url: 'https://www.zelezarstvizizkov.cz/',
    boundaryRegexp: new RegExp('^http.*'),
    redisOptions: 6379
})

