import { WebSocketServer } from 'ws';

import { Redis } from 'ioredis';
export function addWebSocketServer() {
    interface ExecutionUpdater {
        executionId: string;
        score: number;
    }
    const server = new WebSocketServer({ port: 3001 });
    server.on('connection', (socket) => {
        socket.on('message', async (message) => {
            try {
                const executionIds = JSON.parse(message.toString()) as string[];
                const redis = new Redis({ port: 6379, host: process.env.REDIS });
                console.log('WS');
                let updaters: ExecutionUpdater[] = [];
                updaters = executionIds.map((executionId) => {
                    return { executionId: executionId, score: 0 };
                });
                const interval = setInterval(async () => {
                    console.log('INTERVAL');
                    for (const updater of updaters) {
                        if (await redis.exists(updater.executionId)) {
                            const crawledSites = await redis.zrange(updater.executionId, updater.score, -1);
                            const parsedSites = crawledSites.map((crawledSite) => {
                                return { executionId: updater.executionId, ...JSON.parse(crawledSite) };
                            });
                            socket.send(JSON.stringify({ crawlRecords: parsedSites, executionFinished: false }));
                            updater.score += parsedSites.length;
                        } else {
                            socket.send(JSON.stringify({ executionFinished: true }));
                            updater.score = -1;
                        }
                    }
                    updaters = updaters.filter((up) => up.score >= 0);
                    if (updaters.length === 0) {
                        clearInterval(interval);
                    }
                }, 1000);
            } catch (error) {
                console.log('WS error:', error);
            }
        });
    });
    return server;
}
