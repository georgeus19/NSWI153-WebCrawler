import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface FilterData {
    url?: string;
    label?: string;
    tags: string[];
    allTags: Set<string>;
}

@Component({
    selector: 'app-website-records-page-filter-dialog',
    templateUrl: './website-records-page-filter-dialog.component.html',
    styleUrls: ['./website-records-page-filter-dialog.component.css'],
})
export class WebsiteRecordsPageFilterDialogComponent {
    constructor(public dialogRef: MatDialogRef<WebsiteRecordsPageFilterDialogComponent>, @Inject(MAT_DIALOG_DATA) public filterData: FilterData) {
        this.tags = new FormControl(filterData.tags);
        console.log('tags', filterData.tags, this.tags);
    }
    tags = new FormControl();
    onNoClick(): void {
        this.dialogRef.close();
    }

    okClick(): void {
        this.filterData.tags = this.tags.value;
        this.dialogRef.close(this.filterData);
    }
}
