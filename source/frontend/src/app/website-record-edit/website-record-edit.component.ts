import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IdEntity } from '@backend/base-types';
import { WebsiteRecord } from '@backend/website-record';
import { fromNumber, toNumber } from '../periodicity';

export interface WebsiteRecordEditInput {
    websiteRecord: WebsiteRecord;
    allTags: Set<string>;
    actionName: string;
}

export interface WebsiteRecordChangeResult {
    updatedWebsiteRecord: WebsiteRecord;
    updatedTags: Set<string>;
}

@Component({
    selector: 'app-website-record-edit',
    templateUrl: './website-record-edit.component.html',
    styleUrls: ['./website-record-edit.component.css'],
})
export class WebsiteRecordEditComponent {
    constructor(
        public dialogRef: MatDialogRef<WebsiteRecordEditComponent>,
        @Inject(MAT_DIALOG_DATA) public websiteRecordInput: WebsiteRecordEditInput
    ) {
        this.websiteRecord = structuredClone(websiteRecordInput.websiteRecord);
        this.tags = new FormControl(this.websiteRecord.tags);
        this.periodicity = fromNumber(this.websiteRecord.periodicity);
        this.allTags = structuredClone(websiteRecordInput.allTags);
    }

    websiteRecord: WebsiteRecord = {} as WebsiteRecord;
    tags = new FormControl();
    periodicity = '';
    allTags = new Set<string>();
    toAddTag = '';

    addTag(): void {
        if (this.toAddTag.length > 0) {
            this.allTags.add(this.toAddTag);
            this.toAddTag = '';
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    okClick(): void {
        if (
            this.empty(this.websiteRecord.label) ||
            this.empty(this.websiteRecord.url) ||
            this.empty(this.websiteRecord.boundaryRegExp) ||
            !this.periodicityOk()
        ) {
            return;
        }
        this.websiteRecord.tags = this.tags.value;
        this.websiteRecord.periodicity = toNumber(this.periodicity);
        const updatedAllTags = structuredClone(this.websiteRecordInput.allTags);
        this.websiteRecord.tags.forEach((tag) => updatedAllTags.add(tag));
        const output: WebsiteRecordChangeResult = { updatedWebsiteRecord: this.websiteRecord, updatedTags: updatedAllTags };
        this.dialogRef.close(output);
    }

    empty(value: string): boolean {
        return value.trim().length == 0;
    }

    periodicityOk(): boolean {
        return toNumber(this.periodicity) > 0;
    }
}
