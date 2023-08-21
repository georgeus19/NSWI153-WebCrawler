const crawling = require('./crawling');


const stream = require('stream');

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
const result = crawling.crawl('https://www.zelezarstvizizkov.cz/', new RegExp('^http.*'));
crawlRecordsObs.subscribe(x => x);




