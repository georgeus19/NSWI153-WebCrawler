import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PagedResults, WebsiteRecord, WebsiteRecordParams, WebsiteRecordWithLastExecution } from '@backend/website-record';
import { Observable, distinct, map, mergeAll, tap } from 'rxjs';
import { IdEntity } from '@backend/base-types';
import { stringify, parse } from 'qs';

@Injectable({
    providedIn: 'root',
})
export class WebsiteRecordsService {
    constructor(private http: HttpClient) {}

    private websiteRecordsUrl = '/website-records';
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    getWebsiteRecords(params: WebsiteRecordParams): Observable<PagedResults<(WebsiteRecordWithLastExecution & IdEntity)[]>> {
        const flattenedParams = { ...params.pagination, ...params.filter, ...params.sort };
        return this.http.get<PagedResults<(WebsiteRecordWithLastExecution & IdEntity)[]>>(`${this.websiteRecordsUrl}?${stringify(flattenedParams)}`);
    }

    getWebsiteRecordTags(): Observable<Set<string>> {
        return this.getWebsiteRecords({}).pipe(
            map((results) => {
                const records = results.data;
                const tags = records.flatMap((record) => record.tags);
                return new Set(tags);
            })
        );
    }

    deleteWebsiteRecords(): Observable<unknown> {
        return this.http.delete(this.websiteRecordsUrl);
    }

    getWebsiteRecord(id: string): Observable<WebsiteRecordWithLastExecution> {
        return this.http.get<WebsiteRecordWithLastExecution>(`${this.websiteRecordsUrl}/${id}`);
    }

    addWebsiteRecord(websiteRecord: WebsiteRecord): Observable<IdEntity> {
        return this.http.post<IdEntity>(this.websiteRecordsUrl, websiteRecord, this.httpOptions);
    }

    updateWebsiteRecord(websiteRecordId: string, websiteRecord: WebsiteRecord): Observable<WebsiteRecord> {
        return this.http.put<WebsiteRecord>(`${this.websiteRecordsUrl}/${websiteRecordId}`, websiteRecord, this.httpOptions);
    }
}
