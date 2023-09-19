import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IdEntity } from '@backend/base-types';
import { WebsiteRecord, WebsiteRecordWithLastExecution } from '@backend/website-record';
import { WebsiteRecordsService } from '../website-records.service';
import { MatDialog } from '@angular/material/dialog';
import { WebsiteRecordChangeResult, WebsiteRecordEditComponent, WebsiteRecordEditInput } from '../website-record-edit/website-record-edit.component';

@Component({
    selector: 'app-website-record-card',
    templateUrl: './website-record-card.component.html',
    styleUrls: ['./website-record-card.component.css'],
})
export class WebsiteRecordCardComponent {
    @Input() websiteRecord?: WebsiteRecordWithLastExecution & IdEntity;
    @Input() allTags?: Set<string>;
    @Output() deleteRecordEvent = new EventEmitter<string>();
    @Output() updatedRecordEvent = new EventEmitter<WebsiteRecordWithLastExecution & IdEntity>();
    @Output() updatedTagsEvent = new EventEmitter<Set<string>>();
    constructor(private websiteRecordService: WebsiteRecordsService, public dialog: MatDialog) {}
    onEdit(websiteRecord: WebsiteRecordWithLastExecution & IdEntity): void {
        const editInput: WebsiteRecordEditInput = { websiteRecord: websiteRecord, allTags: this.allTags ? this.allTags : new Set<string>() };
        const editDialogRef = this.dialog.open(WebsiteRecordEditComponent, {
            data: editInput,
        });
        editDialogRef.afterClosed().subscribe((editResult: WebsiteRecordChangeResult) => {
            if (editResult) {
                const record: any = { ...editResult.updatedWebsiteRecord };
                delete record.id;
                this.websiteRecordService
                    .updateWebsiteRecord(editResult.updatedWebsiteRecord.id, record)
                    .subscribe((updatedRecord: WebsiteRecordWithLastExecution & IdEntity) => {
                        this.updatedRecordEvent.emit(updatedRecord);
                        this.updatedTagsEvent.emit(editResult.updatedTags);
                    });
            }
        });
    }
    onDelete(): void {
        if (this.websiteRecord) {
            const id = this.websiteRecord.id;
            this.websiteRecordService.deleteWebsiteRecord(this.websiteRecord.id).subscribe((_) => this.deleteRecordEvent.emit(id));
        }
    }
    onCrawl(): void {
        console.log('do crawling');
    }
}
