import { IdEntity } from '../base-types';

export type FinishedCrawlingExecutionStatus = 'finished' | 'failed' | 'cancelled';
export type RunningCrawlingExecutionStatus = 'running';
export type CrawlingExecutionStatus = FinishedCrawlingExecutionStatus | RunningCrawlingExecutionStatus;

export type CrawlingExecution = FinishedCrawlingExecution | RunningCrawlingExecution;

export interface FinishedCrawlingExecution {
    start: Date;
    end: Date;
    sitesCrawled: number;
    status: FinishedCrawlingExecutionStatus;
}

export interface RunningCrawlingExecution {
    status: RunningCrawlingExecutionStatus;
    start: Date;
}

export type CrawlingExecutionWithWebsiteRecordId = CrawlingExecution & { websiteRecordId: string };

export interface CrawlRecord {
    url: string;
    crawlTime: Date;
    title: string;
    links: string[];
}

export interface CrawlRecordWithOwner extends CrawlRecord {
    websiteRecordId: string;
}

export interface CrawlRecordWithExecutionId extends CrawlRecord {
    executionId: string;
}

export function createNewRunningExecution(executionId: string): RunningCrawlingExecution & IdEntity {
    return {
        id: executionId,
        status: 'running',
        start: new Date(Date.now()),
    };
}
