import { IdEntity } from './base-types';
import { FinishedCrawlingExecution, RunningCrawlingExecution } from './crawling-executor/crawling-execution';

export interface WebsiteRecord {
    // id: string;
    url: string;
    boundaryRegExp: string;
    periodicity: number;
    label: string;
    active: boolean;
    tags: string[];
}

export interface HasExecutions {
    executions: ((FinishedCrawlingExecution | RunningCrawlingExecution) & IdEntity)[];
}

export interface StoredWebsiteRecord extends WebsiteRecord, HasExecutions {}
