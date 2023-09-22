import { Injectable } from '@angular/core';
import { CrawlRecord, CrawlRecordWithExecutionId } from '@backend/crawling-executor/crawling-execution';

export interface ExecutionSitesUpdate {
    crawlRecords: CrawlRecordWithExecutionId[];
    executionFinished: boolean;
}
@Injectable({
    providedIn: 'root',
})
export class ExecutionsSocketService {
    private ws: WebSocket;
    constructor() {
        this.ws = new WebSocket('ws://localhost:3001');
    }

    onMessage(f: (data: ExecutionSitesUpdate) => void) {
        this.ws.onmessage = function (event) {
            // console.log('Received by WS', event);
            const data = JSON.parse(event.data);
            f(data);
        };
    }

    send(executionIds: string[]) {
        this.ws.onopen = (event) => {
            console.log('Open web socket');
            // if (this.ws.readyState === 1) {
            // console.log('Send by WS', executionIds);
            this.ws.send(JSON.stringify(executionIds));
            console.log('X');
            // } else {
            // setTimeout(() => {
            // console.log('Send by WS', executionIds);
            // this.ws.send(JSON.stringify(executionIds));
            // }, 300);
            // }
        };
    }
}
