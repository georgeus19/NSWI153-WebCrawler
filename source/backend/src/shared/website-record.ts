import { FinishedCrawlingExecution, RunningCrawlingExecution } from './crawling-execution';

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
    executions: (FinishedCrawlingExecution | RunningCrawlingExecution)[];
}

export interface StoredWebsiteRecord extends WebsiteRecord, HasExecutions {}
