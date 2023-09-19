import { Component, OnInit } from '@angular/core';
import { WebsiteRecordsService } from '../website-records.service';
import { SortParams, WebsiteRecord, WebsiteRecordParams, WebsiteRecordWithLastExecution } from '@backend/website-record';
import { IdEntity, Pagination } from '@backend/base-types';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import {
    FilterData,
    WebsiteRecordsPageFilterDialogComponent,
} from '../website-records-page-filter-dialog/website-records-page-filter-dialog.component';
import { SortData, WebsiteRecordsPageSortDialogComponent } from '../website-records-page-sort-dialog/website-records-page-sort-dialog.component';
import { WebsiteRecordChangeResult, WebsiteRecordEditComponent, WebsiteRecordEditInput } from '../website-record-edit/website-record-edit.component';

@Component({
    selector: 'app-website-records-page',
    templateUrl: './website-records-page.component.html',
    styleUrls: ['./website-records-page.component.css'],
})
export class WebsiteRecordsPageComponent implements OnInit {
    websiteRecords: (WebsiteRecordWithLastExecution & IdEntity)[] = [];
    pagination: Pagination = { length: 0 };
    pageSize = 12;
    pageIndex = 0;
    filterData: FilterData = { tags: [], allTags: new Set<string>() };
    sortData: SortData = { sortBy: 'lastExecution', asc: 'desc' };
    constructor(private websiteRecordsService: WebsiteRecordsService, public dialog: MatDialog) {}
    ngOnInit(): void {
        this.refresh();
    }

    refresh(): void {
        this.pageSize = 12;
        this.pageIndex = 0;
        this.filterData = { tags: [], allTags: new Set<string>() };
        this.sortData = { sortBy: 'lastExecution', asc: 'desc' };
        this.getWebsiteRecords();
        this.websiteRecordsService.getWebsiteRecordTags().subscribe((tags) => {
            this.filterData.allTags = tags;
        });
    }

    handlePageEvent(e: PageEvent) {
        console.log(e);
        this.pageSize = e.pageSize;
        this.pageIndex = e.pageIndex;

        this.getWebsiteRecords();
        // this.pageEvent = e;
        // this.length = e.length;
        // this.pageSize = e.pageSize;
        // this.pageIndex = e.pageIndex;
    }

    getWebsiteRecords(): void {
        const pagination = { limit: this.pageSize, skip: this.pageIndex * this.pageSize };
        const filter = {
            url: this.filterData.url,
            label: this.filterData.label,
            tags: this.filterData.tags.length > 0 ? this.filterData.tags : undefined,
        };

        this.websiteRecordsService.getWebsiteRecords({ pagination: pagination, filter: filter, sort: this.sortData }).subscribe((websiteRecords) => {
            console.log(websiteRecords);
            this.websiteRecords = websiteRecords.data;
            console.log(this.websiteRecords);
            this.pagination = websiteRecords.pagination;
        });
    }

    openFilterDialog(): void {
        const filterDialogRef = this.dialog.open(WebsiteRecordsPageFilterDialogComponent, {
            data: this.filterData,
        });
        filterDialogRef.afterClosed().subscribe((resultFilterData) => {
            if (resultFilterData) {
                this.filterData = resultFilterData;
                console.log('filterData', this.filterData);
                this.pageSize = 12;
                this.pageIndex = 0;
                this.getWebsiteRecords();
            }
        });
    }

    openSortDialog(): void {
        const sortDialogRef = this.dialog.open(WebsiteRecordsPageSortDialogComponent, {
            data: this.sortData,
        });
        sortDialogRef.afterClosed().subscribe((resultSortData) => {
            if (resultSortData) {
                this.sortData = resultSortData;
                this.pageSize = 12;
                this.pageIndex = 0;
                this.getWebsiteRecords();
            }
        });
    }

    onRecordDelete(): void {
        this.getWebsiteRecords();
    }

    onRecordUpdate(): void {
        this.getWebsiteRecords();
    }

    onTagsUpdate(tags: Set<string>): void {
        this.filterData.allTags = tags;
    }

    addWebsiteRecord(): void {
        const emptyRecord: WebsiteRecord = {
            label: '',
            active: true,
            boundaryRegExp: '^http.*',
            periodicity: 0,
            url: '',
            tags: [],
        };
        const editInput: WebsiteRecordEditInput = { websiteRecord: emptyRecord, allTags: this.filterData.allTags, actionName: 'Add' };
        const editDialogRef = this.dialog.open(WebsiteRecordEditComponent, {
            data: editInput,
        });
        editDialogRef.afterClosed().subscribe((editResult: WebsiteRecordChangeResult) => {
            if (editResult) {
                this.websiteRecordsService.addWebsiteRecord(editResult.updatedWebsiteRecord).subscribe((newRecordId) => {
                    this.getWebsiteRecords();
                });
            }
        });
    }
}
