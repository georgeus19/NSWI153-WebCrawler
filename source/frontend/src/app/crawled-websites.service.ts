import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IdEntity } from '@backend/base-types';
import { CrawlRecord, CrawlRecordWithOwner } from '@backend/crawling-executor/crawling-execution';
import { WebsiteRecordWithLastExecution } from '@backend/website-record';
import { stringify, parse } from 'qs';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CrawledWebsitesService {
    constructor(private http: HttpClient) {}

    private crawledWebsitesUrl = '/api/crawled-websites';
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    getCrawledWebsites(websiteRecords: string[]): Observable<CrawlRecordWithOwner[]> {
        const params = { websiteRecords: websiteRecords };
        return this.http.get<CrawlRecordWithOwner[]>(`${this.crawledWebsitesUrl}?${stringify(params)}`);
    }

    getWebsiteRecords(website: string): Observable<(WebsiteRecordWithLastExecution & IdEntity)[]> {
        const params1: { url: string } = { url: website };

        return this.http.get<(WebsiteRecordWithLastExecution & IdEntity)[]>(`/api/crawled-website?${stringify(params1)}`);
    }
}
