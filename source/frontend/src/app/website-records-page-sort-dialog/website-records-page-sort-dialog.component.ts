import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-website-records-page-sort-dialog',
    templateUrl: './website-records-page-sort-dialog.component.html',
    styleUrls: ['./website-records-page-sort-dialog.component.css'],
})
export class WebsiteRecordsPageSortDialogComponent {
    constructor(public dialogRef: MatDialogRef<WebsiteRecordsPageSortDialogComponent>, @Inject(MAT_DIALOG_DATA) public filterDataInput: string) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    okClick(): void {
        this.dialogRef.close('x');
    }
}
