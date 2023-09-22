import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GraphNode } from '../website-graph/website-graph.component';
import { ExecutionsService } from '../executions.service';
import { IdEntity } from '@backend/base-types';
import { WebsiteRecord, WebsiteRecordWithLastExecution } from '@backend/website-record';
import { CrawledWebsitesService } from '../crawled-websites.service';

export interface CreateWebsiteRecordResult {
    type: 'record';
    url: string;
}

@Component({
    selector: 'app-node-detail-dialog',
    templateUrl: './node-detail-dialog.component.html',
    styleUrls: ['./node-detail-dialog.component.css'],
})
export class NodeDetailDialogComponent {
    node: any;
    constructor(
        public dialogRef: MatDialogRef<NodeDetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public nodeInput: GraphNode,
        private executionsService: ExecutionsService,
        private crawledWebsitesService: CrawledWebsitesService
    ) {
        this.node = structuredClone(nodeInput);
        (this.node as any).val.websiteRecords = [];
        crawledWebsitesService.getWebsiteRecords(this.node.val.url).subscribe((websiteRecords: (WebsiteRecordWithLastExecution & IdEntity)[]) => {
            (this.node as any).val.websiteRecords = websiteRecords;
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    startExecution(websiteRecord: WebsiteRecord & IdEntity): void {
        this.executionsService.addExecution(websiteRecord.id).subscribe((r) => {
            alert(`Execution for ${websiteRecord.label} was started.`);
        });
    }

    okClick(): void {
        this.dialogRef.close();
    }

    createWebsiteRecordClick(): void {
        this.dialogRef.close({ type: 'record', url: this.node.val.url });
    }
}
