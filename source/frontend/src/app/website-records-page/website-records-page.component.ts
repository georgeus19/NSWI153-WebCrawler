import { Component, OnInit } from '@angular/core';
import { WebsiteRecordsService } from '../website-records.service';
import { WebsiteRecordWithLastExecution } from '@backend/website-record';
import { IdEntity } from '@backend/base-types';

@Component({
    selector: 'app-website-records-page',
    templateUrl: './website-records-page.component.html',
    styleUrls: ['./website-records-page.component.css'],
})
export class WebsiteRecordsPageComponent implements OnInit {
    websiteRecords: (WebsiteRecordWithLastExecution & IdEntity)[] = [];
    constructor(private websiteRecordsService: WebsiteRecordsService) {}
    ngOnInit(): void {
        this.websiteRecordsService
            .getWebsiteRecords({ pagination: { limit: 10, skip: 3 } })
            .subscribe((websiteRecords) => (this.websiteRecords = websiteRecords));
    }
}
