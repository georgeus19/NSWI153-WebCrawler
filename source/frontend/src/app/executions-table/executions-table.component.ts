import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IdEntity } from '@backend/base-types';
import { CrawlingExecution } from '@backend/crawling-executor/crawling-execution';
import { WebsiteRecord } from '@backend/website-record';

export interface ExecutionWithRecord {
    execution: CrawlingExecution & IdEntity;
    record: WebsiteRecord & IdEntity;
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
        console.log('MMMMMMMMMMMMMMM');
        const sortedExecutions = this.executions;
        sortedExecutions.sort(
            (a: ExecutionWithRecord, b: ExecutionWithRecord) => new Date(a.execution.start).getTime() + new Date(b.execution.start).getTime()
        );
        console.log('sortedExecutions', sortedExecutions);
        this.dataSource = new MatTableDataSource<ExecutionWithRecord>(sortedExecutions);
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
