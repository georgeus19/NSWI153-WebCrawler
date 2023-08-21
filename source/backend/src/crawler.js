const crawling = require('./crawling');
const Redis = require("ioredis");
const {parentPort, workerData} = require('worker_threads');
const process = require('process');

console.log('process.pid', process.pid);

const { executionId, url, boundaryRegexp, redisOptions } = workerData;

const redis = new Redis(redisOptions);

let score = 0;
let count = 0;
const startTime = Date.now();

const saveCrawlRecord = async (r) => {
    try {
        await redis.zadd(executionId, ++score, JSON.stringify(r));
        ++count;
    } catch(error) {
        console.log(error);
    }
    
}

const cancel = () => {
    cancelCrawling = false;
    redis.exists(executionId, (exists) => {
        cancelCrawling = !exists;
    });
    return cancelCrawling;
}

// crawling.crawl('https://www.zelezarstvizizkov.cz/', new RegExp('^http.*'), saveCrawlRecord, cancel)
crawling.crawl(url, boundaryRegexp, saveCrawlRecord, cancel)
.then((finished) => { 
    const endTime = Date.now();

    parentPort.postMessage({
        start: startTime,
        end: endTime,
        sitesCrawled: count,
        status: finished ? 'finished' : 'failed'
    });
    redis.disconnect();
});
