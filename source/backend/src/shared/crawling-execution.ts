export interface FinishedCrawlingExecution {
    start: string;
    end: string;
    sitesCrawled: number;
    status: 'finished' | 'failed';
}

export interface RunningCrawlingExecution {
    status: 'running';
}

export type CrawlingExecutionStatus = 'finished' | 'failed' | 'running';

export interface CrawlRecord {
    url: string;
    crawlTime: string;
    title: string;
    links: string[];
}
