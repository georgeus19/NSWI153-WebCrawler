import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { addWebsiteRecordsApi } from './api/website-records';
import bodyParser from 'body-parser';
import { addCrawlExecutionsApi } from './api/crawl-executions';
import { createCrawlingExecutor } from './crawling-executor/executor';
import { addCrawledWebsitesApi } from './api/crawled-websites';

import { graphqlHTTP } from 'express-graphql';
import dotenv from 'dotenv';
import { addWebSocketServer } from './api/websocket';
import { createGraphQLSchema } from './api/graphql';

dotenv.config();

const mongoUri: string = process.env.MONGO!;
// const mongoUri = 'mongodb://mongo:27017';
const mongoClient = new MongoClient(mongoUri);
const app = express();

const ws = addWebSocketServer();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());

const schema = createGraphQLSchema(mongoClient);

app.use(
    '/graphql',
    graphqlHTTP({
        schema: schema,
        graphiql: true,
    })
);

const executor = createCrawlingExecutor(mongoClient, { port: 6379, host: process.env.REDIS });
addWebsiteRecordsApi(app, mongoClient, executor);
addCrawledWebsitesApi(app, mongoClient);
addCrawlExecutionsApi(app, mongoClient, executor);

executor.start();

app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.listen(3000, () => {
    console.log('App listening on port 3000');
});
