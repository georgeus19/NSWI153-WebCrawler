import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CrawlingExecution, CrawlingExecutionWithWebsiteRecordId } from '@backend/crawling-executor/crawling-execution';
import { ExecutionsService } from '../executions.service';
import { IdEntity } from '@backend/base-types';
import { WebsiteRecordWithLastExecution } from '@backend/website-record';
import { WebsiteRecordsService } from '../website-records.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';

interface ExecutionWithRecord {
    execution: CrawlingExecutionWithWebsiteRecordId & IdEntity;
    record: WebsiteRecordWithLastExecution & IdEntity;
}

@Component({
    selector: 'app-executions-page',
    templateUrl: './executions-page.component.html',
    styleUrls: ['./executions-page.component.css'],
})
export class ExecutionsPageComponent implements OnInit {
    constructor(private executionsService: ExecutionsService, private websiteRecordsService: WebsiteRecordsService) {}
    executions: ExecutionWithRecord[] = [];
    labelFilter = new FormControl('');

    dataSource = new MatTableDataSource<ExecutionWithRecord>([]);
    columns = ['label', 'execution-status', 'start', 'end', 'number-sites-crawled'];

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
                this.dataSource = new MatTableDataSource<ExecutionWithRecord>(this.executions);
                // this.dataSource.paginator = this.paginator;
                // this.labelFilter.valueChanges.subscribe((val) => {
                //     console.log(val);
                //     if (val) {
                //         this.dataSource.filter = val.trim().toLowerCase();
                //     } else {
                //         this.dataSource.filter = '';
                //     }
                // });
                // this.dataSource.filterPredicate = (e: ExecutionWithRecord, filter: string) => {
                //     console.log(e, filter);
                //     const label = e.record.label.trim().toLocaleLowerCase();
                //     if (label.includes(filter)) {
                //         return true;
                //     }
                //     return false;
                // };
            });
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}
