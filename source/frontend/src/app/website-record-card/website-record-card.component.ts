import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IdEntity } from '@backend/base-types';
import { WebsiteRecord, WebsiteRecordWithLastExecution } from '@backend/website-record';
import { WebsiteRecordsService } from '../website-records.service';
import { MatDialog } from '@angular/material/dialog';
import { WebsiteRecordChangeResult, WebsiteRecordEditComponent, WebsiteRecordEditInput } from '../website-record-edit/website-record-edit.component';
import { fromNumber, toNumber } from '../periodicity';
import { RoutePaths } from '../app-routing.module';
import { ExecutionsService } from '../executions.service';
import { RunningCrawlingExecution } from '@backend/crawling-executor/crawling-execution';

@Component({
    selector: 'app-website-record-card',
    templateUrl: './website-record-card.component.html',
    styleUrls: ['./website-record-card.component.css'],
})
export class WebsiteRecordCardComponent {
    @Input() websiteRecord?: WebsiteRecordWithLastExecution & IdEntity;
    @Input() allTags?: Set<string>;
    @Input() showRegexp?: boolean;
    @Input() visualized = false;
    @Output() deleteRecordEvent = new EventEmitter<string>();
    @Output() newExecutionEvent = new EventEmitter<RunningCrawlingExecution & IdEntity>();
    @Output() updatedRecordEvent = new EventEmitter<WebsiteRecordWithLastExecution & IdEntity>();
    @Output() updatedTagsEvent = new EventEmitter<Set<string>>();
    @Output() visualizeChangeEvent = new EventEmitter<WebsiteRecord & IdEntity>();

    constructor(private websiteRecordService: WebsiteRecordsService, private executionsService: ExecutionsService, public dialog: MatDialog) {}

    onEdit(websiteRecord: WebsiteRecordWithLastExecution & IdEntity): void {
        const editInput: WebsiteRecordEditInput = {
            websiteRecord: websiteRecord,
            allTags: this.allTags ? this.allTags : new Set<string>(),
            actionName: 'Edit',
        };
        const editDialogRef = this.dialog.open(WebsiteRecordEditComponent, {
            data: editInput,
        });
        editDialogRef.afterClosed().subscribe((editResult) => {
            if (editResult) {
                const record: any = {
                    ...editResult.updatedWebsiteRecord,
                };
                delete record.id;
                this.websiteRecordService
                    .updateWebsiteRecord(websiteRecord.id, record)
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

    onStartNewExecution(): void {
        if (this.websiteRecord) {
            this.executionsService.addExecution(this.websiteRecord.id).subscribe((execution) => {
                if (this.websiteRecord) {
                    this.websiteRecord.lastExecution = execution;
                    console.log('XXX');
                    this.newExecutionEvent.emit(execution);
                }
            });
        }
    }

    onVisualizeChange(): void {
        console.log('this.websiteRecord?.id', this.websiteRecord?.id);
        this.visualized = !this.visualized;
        this.visualizeChangeEvent.emit(this.websiteRecord);
    }

    fromNumber = fromNumber;
    routePaths = RoutePaths;
}
