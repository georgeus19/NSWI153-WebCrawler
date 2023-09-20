import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IdEntity } from '@backend/base-types';
import { CrawlingExecutionWithWebsiteRecordId } from '@backend/crawling-executor/crawling-execution';
import { WebsiteRecordWithLastExecution } from '@backend/website-record';

interface ExecutionWithRecord {
    execution: CrawlingExecutionWithWebsiteRecordId & IdEntity;
    record: WebsiteRecordWithLastExecution & IdEntity;
}

@Component({
    selector: 'app-executions-table',
    templateUrl: './executions-table.component.html',
    styleUrls: ['./executions-table.component.css'],
})
export class ExecutionsTableComponent implements OnChanges {
    @Input() executions: ExecutionWithRecord[] = [];
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    labelFilter = new FormControl('');
    columns = ['label', 'execution-status', 'start', 'end', 'number-sites-crawled'];

    dataSource = new MatTableDataSource<ExecutionWithRecord>([]);

    ngOnChanges(changes: SimpleChanges): void {
        this.dataSource = new MatTableDataSource<ExecutionWithRecord>(this.executions);
        this.dataSource.paginator = this.paginator;
        this.labelFilter.valueChanges.subscribe((val) => {
            console.log(val);
            if (val) {
                this.dataSource.filter = val.trim().toLowerCase();
            } else {
                this.dataSource.filter = '';
            }
        });
        this.dataSource.filterPredicate = (e: ExecutionWithRecord, filter: string) => {
            console.log(e, filter);
            const label = e.record.label.trim().toLocaleLowerCase();
            if (label.includes(filter)) {
                return true;
            }
            return false;
        };
    }
}
