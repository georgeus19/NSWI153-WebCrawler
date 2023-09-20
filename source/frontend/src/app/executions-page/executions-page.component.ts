import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CrawlingExecution, CrawlingExecutionWithWebsiteRecordId } from '@backend/crawling-executor/crawling-execution';
import { ExecutionsService } from '../executions.service';
import { IdEntity } from '@backend/base-types';
import { WebsiteRecordWithLastExecution } from '@backend/website-record';
import { WebsiteRecordsService } from '../website-records.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { ExecutionWithRecord } from '../executions-table/executions-table.component';

@Component({
    selector: 'app-executions-page',
    templateUrl: './executions-page.component.html',
    styleUrls: ['./executions-page.component.css'],
})
export class ExecutionsPageComponent implements OnInit {
    constructor(private executionsService: ExecutionsService, private websiteRecordsService: WebsiteRecordsService) {}
    executions: ExecutionWithRecord[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    ngOnInit(): void {
        this.executionsService.getExecutions().subscribe((executions) => {
            const websiteRecordIds = new Set<string>();
            executions.map((e) => e.websiteRecordId).forEach((websiteRecordId) => websiteRecordIds.add(websiteRecordId));
            this.websiteRecordsService.getWebsiteRecords({}).subscribe((records) => {
                console.log(websiteRecordIds);
                const websiteRecords = records.data.filter((record) => websiteRecordIds.has(record.id));
                this.executions = executions.map((execution) => {
                    return {
                        execution: execution,
                        record: websiteRecords.find((record) => record.id === execution.websiteRecordId),
                    } as ExecutionWithRecord;
                });
            });
        });
    }
}
