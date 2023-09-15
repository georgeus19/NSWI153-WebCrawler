import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WebsiteRecord, WebsiteRecordParams, WebsiteRecordWithLastExecution } from '@backend/website-record';
import { Observable } from 'rxjs';
import { IdEntity } from '@backend/base-types';

@Injectable({
    providedIn: 'root',
})
export class WebsiteRecordsService {
    constructor(private http: HttpClient) {}

    private websiteRecordsUrl = '/website-records';
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    getWebsiteRecords(params: WebsiteRecordParams): Observable<(WebsiteRecordWithLastExecution & IdEntity)[]> {
        const inOne: Record<string, string> = {};
        const xx = { ...params.pagination, ...params.filter, ...params.sort };
        Object.getOwnPropertyNames(xx)
            // .filter((p) => p)
            .map((p) => {
                {
                    inOne[p] = xx[p as keyof typeof xx]!.toString();
                }
            });
        console.log(inOne);
        return this.http.get<(WebsiteRecordWithLastExecution & IdEntity)[]>(`${this.websiteRecordsUrl}?${new URLSearchParams(inOne).toString()}`);
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
