import * as htmlparser2 from 'htmlparser2';
import axios from 'axios';
import { CrawlRecord, FinishedCrawlingExecutionStatus } from './crawling-execution';
import isUrl from 'is-url';

export async function crawl(
    website: string,
    boundaryRegexp: RegExp,
    saveCrawlRecord: (record: CrawlRecord) => Promise<void>,
    cancel: () => boolean
): Promise<FinishedCrawlingExecutionStatus> {
    const websitesToCrawlQueue = [website];

    const alreadyCrawledWebsites = new Set();
    let websiteToCrawl: string | undefined;
    while ((websiteToCrawl = websitesToCrawlQueue.shift())) {
        if (alreadyCrawledWebsites.has(websiteToCrawl)) {
            continue;
        }
        alreadyCrawledWebsites.add(websiteToCrawl);
        console.log('websiteToCrawl', websiteToCrawl);

        const scrapeResult = await scrape(websiteToCrawl);
        if (cancel()) {
            return 'cancelled';
        }
        if (successfulScrape(scrapeResult)) {
            const links = scrapeResult.links
                .filter((link) => {
                    try {
                        const url = new URL(link, websiteToCrawl);
                        return true;
                    } catch {
                        return false;
                    }
                })
                .map((link) => {
                    const url = new URL(link, websiteToCrawl);
                    return url.origin + url.pathname;
                });
            websitesToCrawlQueue.push(...links.filter((link) => boundaryRegexp.test(link) && !alreadyCrawledWebsites.has(link)));
            await saveCrawlRecord({
                url: websiteToCrawl,
                crawlTime: new Date(Date.now()),
                title: scrapeResult.title,
                links: links,
            });
        }
    }

    if (alreadyCrawledWebsites.size > 1) {
        return 'finished';
    } else {
        return 'failed';
    }
}

function successfulScrape(result: { title: string; links: string[] } | { error: boolean }): result is { title: string; links: string[] } {
    return Object.hasOwn(result, 'links');
}

async function scrape(webpage: string): Promise<{ title: string; links: string[] } | { error: boolean }> {
    if (!isUrl(webpage)) {
        return {
            title: '',
            links: [],
        };
    }
    try {
        const response = await axios.get(webpage, { responseType: 'text', timeout: 2000 });
        const html: string = response.data;
        const links: string[] = [];
        let title: string = '';
        let titleElement = false;

        const parser = new htmlparser2.Parser({
            onopentag(name, attributes) {
                if (name === 'a') {
                    if (attributes.href) {
                        // && (typeof attributes.href === 'string' || attributes.href instanceof String)
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
            },
        });
        parser.write(html);
        return {
            title: title,
            links: links,
        };
    } catch (error) {
        // console.log('crawl error:', error);
        return { error: true };
    }
}
