import { CrawlRecord, crawl } from './crawling';
import Redis, { RedisOptions } from 'ioredis';
import workerpool from 'workerpool';

interface WorkerInput {
    executionId: string;
    url: string;
    boundaryRegexp: string;
    redisOptions: RedisOptions;
}

async function runCrawlingExecution(workerInput: WorkerInput) {
    const { executionId, url, boundaryRegexp, redisOptions } = workerInput;
    const redis = new Redis(redisOptions);
    let score = 0;
    let count = 0;
    const startTime = Date.now();

    const saveCrawlRecord = async (record: CrawlRecord) => {
        try {
            await redis.zadd(executionId, ++score, JSON.stringify(record));
            ++count;
        } catch (error) {
            console.log(error);
        }
    };

    const cancel = () => {
        let cancelCrawling = false;
        redis.exists(executionId, (exists) => {
            cancelCrawling = !exists;
        });
        return cancelCrawling;
    };

    // crawling.crawl('https://www.zelezarstvizizkov.cz/', new RegExp('^http.*'), saveCrawlRecord, cancel)
    const finished = await crawl(url, new RegExp(boundaryRegexp), saveCrawlRecord, cancel);
    const endTime = Date.now();
    redis.disconnect();
    return {
        start: startTime,
        end: endTime,
        sitesCrawled: count,
        status: finished ? 'finished' : 'failed',
    };
}

workerpool.worker({
    runCrawlingExecution: runCrawlingExecution,
});
