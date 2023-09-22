import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CrawledWebsitesService } from '../crawled-websites.service';
import { CrawlRecord, CrawlRecordWithOwner } from '@backend/crawling-executor/crawling-execution';
import ForceGraph, { GraphData, NodeObject } from 'force-graph';
import { LinkObject } from 'force-graph';
import { WebsiteRecord, WebsiteRecordWithLastExecution } from '@backend/website-record';
import { IdEntity } from '@backend/base-types';
import { ExecutionSitesUpdate, ExecutionsSocketService } from '../executions-socket.service';
import { Observable, Subject, multicast, of, share } from 'rxjs';

export interface GraphNode {
    id: string;
    val: CrawledNodeValue | NotCrawledNodeValue;
}

export interface CrawledNodeValue {
    url: string;
    crawlTime: Date;
    crawled: true;
    // websiteRecordIds: string[];
    // websiteRecords?: (WebsiteRecord & IdEntity)[];
}

export interface NotCrawledNodeValue {
    url: string;
    crawled: false;
}

@Component({
    selector: 'app-website-graph',
    templateUrl: './website-graph.component.html',
    styleUrls: ['./website-graph.component.css'],
})
export class WebsiteGraphComponent implements OnChanges {
    constructor(private crawledWebsitesService: CrawledWebsitesService, private elementRef: ElementRef) {}

    @Input() websiteRecords: (WebsiteRecordWithLastExecution & IdEntity)[] = [];
    @Output() graphDetailEvent = new EventEmitter<GraphNode>();
    // crawledWebsites: CrawlRecordWithOwner[] = [];
    graph: any;
    domainView = false;
    @Input() liveMode = false;
    nodes = new Map<string, GraphNode>();
    links = new Set<string>();
    @Input() change = false;
    ngOnChanges(changes: SimpleChanges): void {
        console.log('MMMMMMMMMMMMMMM');
        console.log(this.websiteRecords);
        this.showGraph();
    }

    createGraph() {
        this.graph = ForceGraph()(document.getElementById('graph')!)
            .onNodeClick((node: any, event: MouseEvent) => {
                // if (node.val.crawled) {
                //     node.val.websiteRecords = node.val.websiteRecordIds.map((id: string) => this.websiteRecords.find((r) => r.id === id));
                // }
                console.log('CLICK', node);
                this.graphDetailEvent.emit(node);
            })

            .nodeId('id') // code from https://github.com/vasturiano/force-graph/blob/master/example/text-nodes/index.html
            .nodeAutoColorBy('group')
            .nodeCanvasObject((node: any, ctx, globalScale) => {
                const label: any = node.id;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions: any = [textWidth, fontSize].map((n) => n + fontSize * 0.2); // some padding

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                // ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = node.color;
                ctx.fillText(label, node.x, node.y);

                node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
            })
            .nodePointerAreaPaint((node: any, color, ctx) => {
                ctx.fillStyle = color;
                const bckgDimensions: any = node.__bckgDimensions;
                bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                // bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
            })
            .linkDirectionalArrowLength(20)
            .linkDirectionalArrowColor('black');
        // .linkDirectionalParticles('value')
        // .linkDirectionalParticleSpeed((d: any) => d.value * 1);
    }

    addLiveGraphData() {
        const runningRecords = this.websiteRecords.filter((r) => r.lastExecution && r.lastExecution.status === 'running');
        if (runningRecords.length > 0) {
            const ws = new ExecutionsSocketService();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ws.send(runningRecords.map((r) => r.lastExecution!.id!));
            ws.onMessage((data: ExecutionSitesUpdate) => {
                if (!data.executionFinished) {
                    console.log('XX', data.crawlRecords);
                    const graphData = this.createWebsiteGraph(data.crawlRecords);
                    console.log('GG', graphData);
                    this.graph.graphData(graphData);
                }
            });
        }
    }

    addOfflineGraphData(records: (WebsiteRecordWithLastExecution & IdEntity)[]): Observable<CrawlRecord[]> {
        if (records.length > 0) {
            const obs = this.crawledWebsitesService.getCrawledWebsites(records.map((r) => r.id)).pipe(share());
            obs.subscribe((websites: CrawlRecord[]) => {
                if (this.domainView) {
                    websites = this.toDomainView(websites);
                }

                this.graph.graphData(this.createWebsiteGraph(websites));
            });
            return obs;
        }
        return of(new Array<CrawlRecord>());
    }

    showGraph() {
        console.log('show graph');
        this.nodes = new Map<string, GraphNode>();
        this.links = new Set<string>();
        this.createGraph();
        console.log('this.websiteRecords', this.websiteRecords, this.liveMode);
        if (this.liveMode && this.websiteRecords.length > 0) {
            const offlineRecords = this.websiteRecords.filter((r) => r.lastExecution && r.lastExecution.status === 'finished');
            console.log('offlineRecords', offlineRecords);
            const obs = this.addOfflineGraphData(offlineRecords);
            obs.subscribe((offlineRecords: CrawlRecord[]) => {
                console.log('XXXXXx');
                this.addLiveGraphData();
            });
            // if (offlineRecords.length > 0) {
            //     this.crawledWebsitesService.getCrawledWebsites(offlineRecords.map((r) => r.id)).subscribe((websites) => {
            //         if (this.domainView) {
            //             websites = this.toDomainView(websites);
            //         }
            //         this.graph.graphData(this.createWebsiteGraph(websites));
            //         this.addLiveGraphData();
            //     });
            // } else {
            //     this.addLiveGraphData();
            // }
        } else if (!this.liveMode && this.websiteRecords.length > 0) {
            this.crawledWebsitesService.getCrawledWebsites(this.websiteRecords.map((r) => r.id)).subscribe((websites) => {
                if (this.domainView) {
                    websites = this.toDomainView(websites);
                }
                this.graph.graphData(this.createWebsiteGraph(websites));
            });
        }
        // const records = this.liveMode ? offlineRecords : this.websiteRecords;
        // this.nodes = new Map<string, GraphNode>();
        // if (records.length > 0) {
        //     this.crawledWebsitesService.getCrawledWebsites(records.map((r) => r.id)).subscribe((websites) => {
        //         if (this.domainView) {
        //             websites = this.toDomainView(websites);
        //         }
        //         this.graph.graphData(this.createWebsiteGraph(websites));

        //         if (this.liveMode) {
        //             const runningRecords = this.websiteRecords.filter((r) => r.lastExecution && r.lastExecution.status === 'running');
        //             if (runningRecords.length > 0) {
        //                 const ws = new ExecutionsSocketService();
        //                 // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //                 ws.send(runningRecords.map((r) => r.lastExecution!.id!));
        //                 ws.onMessage((data: ExecutionSitesUpdate) => {
        //                     if (data.executionFinished) {
        //                         console.log(data.crawlRecords);
        //                     }
        //                 });
        //             }
        //         }
        //     });
        // } else {
        // }
    }

    isUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    toDomainView(websites: CrawlRecord[]): CrawlRecord[] {
        return websites
            .filter((website) => this.isUrl(website.url))
            .map((website) => {
                website.url = new URL(website.url).hostname;
                website.links = website.links.filter((link) => this.isUrl(link)).map((link) => new URL(link).hostname);
                return website;
            });
    }

    createWebsiteGraph(websites: CrawlRecord[]): GraphData {
        // this.crawledWebsites = websites;
        // this.nodes = new Map<string, GraphNode>();

        websites.forEach((website) => {
            const savedNode = this.nodes.get(website.url);
            if (savedNode && savedNode.val.crawled) {
                // savedNode.val.websiteRecordIds.push(website.websiteRecordId);
                if (new Date(savedNode.val.crawlTime).getTime() < new Date(website.crawlTime).getTime()) {
                    savedNode.val.crawlTime = website.crawlTime;
                }
            } else {
                const node: GraphNode = {
                    id: website.url,
                    val: {
                        url: website.url,
                        crawled: true,
                        crawlTime: website.crawlTime,
                        // websiteRecordIds: [website.websiteRecordId],
                    },
                };
                this.nodes.set(website.url, node);
            }
        });
        websites.forEach((website) => {
            website.links
                .filter((link) => !this.nodes.has(link))
                .forEach((link) => {
                    this.nodes.set(link, { id: link, val: { crawled: false, url: link } });
                });
        });
        // console.log(
        //     'XX',
        //     websites.flatMap((website) => {
        //         return website.links.map((link) => {
        //             return { source: website.url, target: link };
        //         });
        //     })
        // );
        websites
            .flatMap((website) => {
                return website.links.map((link) => {
                    return { source: website.url, target: link };
                });
            })
            .forEach((link) => {
                this.links.add(JSON.stringify(link));
            });
        console.log('this.links', this.links);
        return {
            nodes: Array.from(this.nodes.values()).map((node: any) => {
                node.color = node.val.crawled ? 'red' : 'blue';
                return node;
            }),
            links: Array.from(this.links).map((link) => JSON.parse(link)),
        };
    }
}
