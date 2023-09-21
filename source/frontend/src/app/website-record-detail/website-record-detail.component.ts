import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsiteRecordsService } from '../website-records.service';
import { WebsiteRecordWithLastExecution } from '@backend/website-record';
import { IdEntity } from '@backend/base-types';
import { ExecutionsService } from '../executions.service';
import { CrawlingExecution, RunningCrawlingExecution } from '@backend/crawling-executor/crawling-execution';
import { ExecutionWithRecord } from '../executions-table/executions-table.component';
import { Location } from '@angular/common';
import { MatTable } from '@angular/material/table';

@Component({
    selector: 'app-website-record-detail',
    templateUrl: './website-record-detail.component.html',
    styleUrls: ['./website-record-detail.component.css'],
})
export class WebsiteRecordDetailComponent implements OnInit {
    id?: string | null;
    websiteRecord?: WebsiteRecordWithLastExecution & IdEntity;
    executions?: (CrawlingExecution & IdEntity)[];
    tableInput: ExecutionWithRecord[] = [];
    allTags = new Set<string>();
    constructor(
        private websiteRecordsService: WebsiteRecordsService,
        private executionsService: ExecutionsService,
        private route: ActivatedRoute,
        private location: Location
    ) {
        this.id = this.route.snapshot.paramMap.get('id');
    }

    ngOnInit(): void {
        this.refresh(this.id);
        this.refresh(this.id);
    }

    refresh(id?: string | null) {
        if (id) {
            this.websiteRecordsService.getWebsiteRecord(id).subscribe((record) => {
                this.executionsService.getExecutions(id).subscribe((executions) => {
                    this.executions = executions;
                    this.websiteRecord = record;
                    this.updateTable();
                });
            });
        }
        this.websiteRecordsService.getWebsiteRecordTags().subscribe((tags) => {
            this.allTags = tags;
        });
    }

    onRecordDelete(): void {
        this.location.back();
    }

    onRecordUpdate(): void {
        if (this.websiteRecord) {
            this.refresh(this.websiteRecord.id);
        }
    }

    onTagsUpdate(tags: Set<string>): void {
        this.allTags = tags;
    }

    onNewExecution(execution: RunningCrawlingExecution & IdEntity): void {
        if (this.websiteRecord) {
            this.websiteRecord.lastExecution = execution;
        }
        if (this.executions) {
            this.executions.push(execution);
        }
        this.updateTable();
    }

    updateTable() {
        if (this.executions && this.websiteRecord) {
            this.tableInput = [
                ...this.executions.map((e) => {
                    const er: ExecutionWithRecord = { execution: e, record: this.websiteRecord! };
                    return er;
                }),
            ];
        }
    }
}
