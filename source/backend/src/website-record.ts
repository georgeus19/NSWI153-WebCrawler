import { IdEntity, Pagination } from './base-types';
import { FinishedCrawlingExecution, RunningCrawlingExecution } from './crawling-executor/crawling-execution';

export interface WebsiteRecord {
    url: string;
    boundaryRegExp: string;
    periodicity: number;
    label: string;
    active: boolean;
    tags: string[];
}

export interface HasLastExecution {
    lastExecution?: (FinishedCrawlingExecution | RunningCrawlingExecution) & IdEntity;
}

export interface WebsiteRecordWithLastExecution extends WebsiteRecord, HasLastExecution {}

export interface HasExecutions {
    executions: ((FinishedCrawlingExecution | RunningCrawlingExecution) & IdEntity)[];
}

export interface StoredWebsiteRecord extends WebsiteRecord, HasExecutions, HasLastExecution {}

export interface PaginationParams {
    skip: number;
    limit: number;
}

export interface WebsiteRecordSortParams {
    lastExecutionFirst?: boolean;
    urlAscending?: boolean;
}

export interface WebsiteRecordFilterParams {
    url?: string;
    label?: string;
    tags?: string[];
}

export interface WebsiteRecordParams {
    pagination?: PaginationParams;
    sort?: WebsiteRecordSortParams;
    filter?: WebsiteRecordFilterParams;
}

export interface PagedResults<T> {
    data: T;
    pagination: Pagination;
}
