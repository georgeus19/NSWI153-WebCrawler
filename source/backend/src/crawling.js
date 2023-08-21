const htmlparser2 = require('htmlparser2');
const { Observable } = require('rxjs');
const axios = require('axios');

async function crawl(website, boundaryRegexp, saveCrawlRecord, cancel) {
    const websitesToCrawlQueue = [website];

    const alreadyCrawledWebsites = new Set();
    while (websitesToCrawlQueue.length > 0) {
        const websiteToCrawl = websitesToCrawlQueue.shift(); 
        if (alreadyCrawledWebsites.has(websiteToCrawl)) {
            continue;
        }
        alreadyCrawledWebsites.add(websiteToCrawl);
        console.log('websiteToCrawl', websiteToCrawl);

        let { title, links, error } = await scrape(websiteToCrawl, boundaryRegexp);
        if (cancel()) {
            break;
        }
        if (!error)  {
            links = links.map((link) => {
                const url = new URL(link, websiteToCrawl);
                return url.origin + url.pathname;
            });
            websitesToCrawlQueue.push(...links.filter((link) => boundaryRegexp.test(link) && !alreadyCrawledWebsites.has(link)));
            await saveCrawlRecord({
                url: websiteToCrawl,
                crawlTime: Date.now(),
                title: title,
                links: links
            });
        }
    }

    console.log("END??")
    if (alreadyCrawledWebsites.size > 1) {
        return true;
    } else {
        return false;
    }
}

async function scrape(webpage) {
    // const response = await fetch(webpage);
    try {
        const response = await axios.get(webpage, {responseType: 'text'});
        const html = await response.data;
        const links = [];
        let title = undefined; 
        let titleElement = false;

        const parser = new htmlparser2.Parser({
            onopentag(name, attributes) {
                if (name === 'a') {
                    if (attributes.href && (typeof attributes.href === 'string' || attributes.href instanceof String)) {
                        links.push(attributes.href);
                    }
                }

                if (name === 'title') {
                    titleElement = true;
                }
            },
            ontext(text) {
                if (titleElement) {
                    title = text;
                }
            },
            onclosetag(name) {
                if (name === 'title') {
                    titleElement = false;
                }
            }
        });
        parser.write(html);
        return {
            title: title,
            links: links
        };
    } catch( error) {
        return { error: true };
    }
    
}

exports.crawl = crawl;