const crawling = require('./crawling');
const { Worker } = require('worker_threads');
const { v4: uuidv4 } = require('uuid');
const process = require('process');

console.log('process.pid', process.pid);


const worker = new Worker(
    __dirname + '/crawler.js',
    {
        workerData: {
            executionId: 'executionCrawlRecords-' + uuidv4(),
            url: 'https://www.zelezarstvizizkov.cz/',
            boundaryRegexp: new RegExp('^http.*'),
            redisOptions: 6379
        }

    }
);

setTimeout(() => {
    console.log('Hey there');
}, 3000)
// while(true);

// let url = new URL('https://www.zelezarstvizizkov.cz/dsdsdd/qqq#ahoj');
// console.log(url.);
// let url2 = new URL('/kontakty', 'https://www.zelezarstvizizkov.cz/vyvoj/');
// console.log(url2)
// let url3 = new URL('kontakty', 'https://www.zelezarstvizizkov.cz/vyvoj/');
// console.log(url3)

// let url4 = new URL('kontakty', 'https://www.zelezarstvizizkov.cz/vyvoj/honimir?a=2');
// console.log(url4)


// let url5 = new URL('https://www.zelezarstvizizkov.cz/123/', 'https://www.XXXXXXXXx.cz/vyvoj/honimir?a=2');
// console.log(url5)



