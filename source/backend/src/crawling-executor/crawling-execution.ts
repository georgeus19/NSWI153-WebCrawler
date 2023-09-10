export interface FinishedCrawlingExecution {
    start: Date;
    end: Date;
    sitesCrawled: number;
    status: 'finished' | 'failed' | 'cancelled';
}

export interface RunningCrawlingExecution {
    status: 'running';
    start: Date;
}

export type CrawlingExecutionStatus = 'finished' | 'failed' | 'running' | 'cancelled';

export interface CrawlRecord {
    url: string;
    crawlTime: Date;
    title: string;
    links: string[];
}
