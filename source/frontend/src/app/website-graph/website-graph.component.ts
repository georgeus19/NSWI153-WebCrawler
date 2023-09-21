import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CrawledWebsitesService } from '../crawled-websites.service';
import { CrawlRecord, CrawlRecordWithOwner } from '@backend/crawling-executor/crawling-execution';
import ForceGraph, { GraphData, NodeObject } from 'force-graph';
import { LinkObject } from 'force-graph';
import { WebsiteRecord } from '@backend/website-record';
import { IdEntity } from '@backend/base-types';

export interface GraphNode {
    id: string;
    val: CrawledNodeValue | NotCrawledNodeValue;
}

export interface CrawledNodeValue {
    url: string;
    crawlTime: Date;
    crawled: true;
    websiteRecordIds: string[];
    websiteRecords?: (WebsiteRecord & IdEntity)[];
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

    @Input() websiteRecords: (WebsiteRecord & IdEntity)[] = [];
    @Output() graphDetailEvent = new EventEmitter<GraphNode>();
    crawledWebsites: CrawlRecordWithOwner[] = [];
    graph: any;
    domainView = false;
    ngOnChanges(changes: SimpleChanges): void {
        console.log('MMMMMMMMMMMMMMM');
        console.log(this.websiteRecords);
        this.showGraph();
    }

    showGraph() {
        console.log('show graph');
        if (this.websiteRecords.length > 0) {
            this.crawledWebsitesService.getCrawledWebsites(this.websiteRecords.map((r) => r.id)).subscribe((websites) => {
                if (this.domainView) {
                    websites = this.toDomainView(websites);
                }
                this.graph = ForceGraph()(document.getElementById('graph')!)
                    .onNodeClick((node: any, event: MouseEvent) => {
                        if (node.val.crawled) {
                            node.val.websiteRecords = node.val.websiteRecordIds.map((id: string) => this.websiteRecords.find((r) => r.id === id));
                        }
                        console.log('CLICK', node);
                        this.graphDetailEvent.emit(node);
                    })
                    .graphData(this.createWebsiteGraph(websites))
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
                        bckgDimensions &&
                            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                        // bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
                    })
                    .linkDirectionalParticles('value')
                    .linkDirectionalParticleSpeed((d: any) => d.value * 1);
            });
        } else {
            this.graph = ForceGraph()(document.getElementById('graph')!);
        }
    }

    isUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    toDomainView(websites: CrawlRecordWithOwner[]): CrawlRecordWithOwner[] {
        return websites
            .filter((website) => this.isUrl(website.url))
            .map((website) => {
                website.url = new URL(website.url).hostname;
                website.links = website.links.filter((link) => this.isUrl(link)).map((link) => new URL(link).hostname);
                return website;
            });
    }

    createWebsiteGraph(websites: CrawlRecordWithOwner[]): GraphData {
        this.crawledWebsites = websites;
        const nodes = new Map<string, GraphNode>();

        this.crawledWebsites.forEach((website) => {
            const savedNode = nodes.get(website.url);
            if (savedNode) {
                (savedNode.val as CrawledNodeValue).websiteRecordIds.push(website.websiteRecordId);
                if (new Date((savedNode.val as CrawledNodeValue).crawlTime).getTime() < new Date(website.crawlTime).getTime()) {
                    (savedNode.val as CrawledNodeValue).crawlTime = website.crawlTime;
                }
            } else {
                const node: GraphNode = {
                    id: website.url,
                    val: {
                        url: website.url,
                        crawled: true,
                        crawlTime: website.crawlTime,
                        websiteRecordIds: [website.websiteRecordId],
                    },
                };
                nodes.set(website.url, node);
            }
        });
        this.crawledWebsites.forEach((website) => {
            website.links
                .filter((link) => !nodes.has(link))
                .forEach((link) => {
                    nodes.set(link, { id: link, val: { crawled: false, url: link } });
                });
        });
        const links: LinkObject[] = this.crawledWebsites.flatMap((website) => {
            return website.links.map((link) => {
                return { source: website.url, target: link };
            });
        });
        return {
            nodes: Array.from(nodes.values()).map((node: any) => {
                node.color = node.val.crawled ? 'red' : 'blue';
                return node;
            }),
            links: links,
        };
    }
}
