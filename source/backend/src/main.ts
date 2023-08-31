import { Worker } from 'worker_threads';
import { v4 as uuidv4 } from 'uuid';
import process from 'process';
import workerpool from 'workerpool';

async function main() {
    const pool = workerpool.pool(__dirname + '/executor.js');
    await pool.exec('runCrawlingExecution', [
        {
            executionId: 'executionCrawlRecords-' + uuidv4(),
            url: 'https://www.zelezarstvizizkov.cz/',
            boundaryRegexp: '^http.*',
            redisOptions: 6379,
        },
    ]);

    pool.terminate();
}

main();
