const crawling = require('./crawling');
const Redis = require("ioredis");
const { v4: uuidv4 } = require('uuid');


// const { url, boundaryRegexp } = WorkerData;
// 'https://www.zelezarstvizizkov.cz/', new RegExp('^http.*')


const redis = new Redis(6379);

score = 0;
executionId = 'executionCrawlRecords-' + uuidv4();

const saveCrawlRecord = async (r) => {
    await redis.zadd(executionId, ++score, JSON.stringify(r));
    
}

const cancel = () => {
    cancelCrawling = false;
    redis.exists(executionId, (exists) => {
        cancelCrawling = !exists;
    });
    return cancelCrawling;
}

crawling.crawl('https://www.zelezarstvizizkov.cz/', new RegExp('^http.*'), saveCrawlRecord, cancel)
.then((x) => { 
    console.log("WW,", x);
    redis.disconnect();
});
// crawling.crawl(url, boundaryRegexp, saveCrawlRecord, cancel);



