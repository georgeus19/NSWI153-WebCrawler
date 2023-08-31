import { CrawlRecord, crawl } from './crawling';
import Redis, { RedisOptions } from 'ioredis';
import workerpool from 'workerpool';

export interface WorkerInput {
    executionId: string;
    url: string;
    boundaryRegexp: string;
    redisOptions: RedisOptions;
}

export type CrawlingExecutionStatus = 'finished' | 'failed';

export interface CrawlingExecution {
    start: string;
    end: string;
    sitesCrawled: number;
    status: CrawlingExecutionStatus;
}

async function runCrawlingExecution(workerInput: WorkerInput): Promise<CrawlingExecution> {
    const { executionId, url, boundaryRegexp, redisOptions } = workerInput;
    const redis = new Redis(redisOptions);
    let score = 0;
    let count = 0;
    const startTime = new Date(Date.now());

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
    const endTime = new Date(Date.now());
    redis.disconnect();
    return {
        start: startTime.toUTCString(),
        end: endTime.toUTCString(),
        sitesCrawled: count,
        status: finished ? 'finished' : 'failed',
    };
}

workerpool.worker({
    runCrawlingExecution: runCrawlingExecution,
});
