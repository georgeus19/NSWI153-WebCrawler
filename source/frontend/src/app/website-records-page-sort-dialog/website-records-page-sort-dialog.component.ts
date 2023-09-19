import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AscOrDesc, WebsiteRecordSortOption } from '@backend/website-record';

export interface SortData {
    sortBy: WebsiteRecordSortOption;
    asc: AscOrDesc;
}

@Component({
    selector: 'app-website-records-page-sort-dialog',
    templateUrl: './website-records-page-sort-dialog.component.html',
    styleUrls: ['./website-records-page-sort-dialog.component.css'],
})
export class WebsiteRecordsPageSortDialogComponent {
    sortData: SortData = { sortBy: 'lastExecution', asc: 'asc' };
    constructor(public dialogRef: MatDialogRef<WebsiteRecordsPageSortDialogComponent>, @Inject(MAT_DIALOG_DATA) public sortInput: SortData) {
        console.log('sortInput', sortInput);
        this.sortData = structuredClone(this.sortInput);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    okClick(): void {
        this.dialogRef.close(this.sortData);
    }
}
