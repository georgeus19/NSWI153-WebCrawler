import { v4 as uuidv4 } from 'uuid';
import { Collection, MongoClient } from 'mongodb';
import workerpool from 'workerpool';
import { WebsiteRecord } from '../website-record';
import { Redis, RedisOptions } from 'ioredis';
import { FinishedCrawlingExecution } from './crawling-execution';
import { getWebsiteRecordsCollection } from '../db-access';

type PendingExecution = WebsiteRecord & {executionId: string};
export function createCrawlingExecutor(mongoClient: MongoClient, redisOptions: RedisOptions) {
    const pool = workerpool.pool(__dirname + '/execution-worker.js');
    const recordsCollection = getWebsiteRecordsCollection(mongoClient);
    const redis = new Redis(redisOptions);
    const executions: PendingExecution[] = [];
    
    function addExecution(executionId: string, websiteRecord: WebsiteRecord) {
        executions.push({executionId: executionId, ...websiteRecord});
    }

    async function runExecution(executionId: string, websiteRecord: WebsiteRecord) {
        const execution = (await pool.exec('runCrawlingExecution', [
            {
                executionId: executionId,
                url: websiteRecord.url,
                boundaryRegexp: websiteRecord.boundaryRegExp,
                redisOptions: redisOptions,
            },
        ])) as FinishedCrawlingExecution;
        const existingKeysCount = await redis.exists(executionId);
        if (existingKeysCount > 0) {

        }

        console.log('execution return', execution);
    }

    

    // pool.terminate();

    return {
        addExecution,
        runExecution
    };
}

// const x = await pool.exec('runCrawlingExecution', [
//     {
//         executionId: 'executionCrawlRecords-' + uuidv4(),
//         url: 'https://www.zelezarstvizizkov.cz/',
//         boundaryRegexp: '^http.*',
//         redisOptions: redisOptions,
//     },
// ]);