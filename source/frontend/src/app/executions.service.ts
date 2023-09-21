import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IdEntity } from '@backend/base-types';
import { CrawlingExecutionWithWebsiteRecordId, RunningCrawlingExecution } from '@backend/crawling-executor/crawling-execution';
import { PagedResults } from '@backend/website-record';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ExecutionsService {
    constructor(private http: HttpClient) {}

    private websiteRecordsUrl = '/api/website-records';
    private executionsUrl = 'crawl-executions';
    // /website-records/:websiteRecordId/crawl-executions
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    getExecutions(websiteRecordId?: string): Observable<(CrawlingExecutionWithWebsiteRecordId & IdEntity)[]> {
        if (websiteRecordId) {
            return this.http.get<(CrawlingExecutionWithWebsiteRecordId & IdEntity)[]>(`/api/website-records/${websiteRecordId}/crawl-executions`);
        } else {
            return this.http.get<(CrawlingExecutionWithWebsiteRecordId & IdEntity)[]>(`/api/website-records-crawl-executions`);
        }
    }

    addExecution(websiteRecordId: string): Observable<RunningCrawlingExecution & IdEntity> {
        return this.http.post<RunningCrawlingExecution & IdEntity>(
            `${this.websiteRecordsUrl}/${websiteRecordId}/${this.executionsUrl}`,
            {},
            this.httpOptions
        );
    }
}
