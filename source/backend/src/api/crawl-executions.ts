import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { getWebsiteRecordsCollection, getCrawlExecutionsCollection } from '../db-access';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { createExecutionController } from '../controllers/crawling-executions-controller';
import { CrawlingExecutor } from '../crawling-executor/executor';

export function addCrawlExecutionsApi(app: express.Express, mongoClient: MongoClient, executor: CrawlingExecutor) {
    const crawlExecutionsPath = '/website-records/crawl-executions';
    const crawlExecutionIdParam = 'crawlExecutionId';
    const crawlExecutionPath = crawlExecutionsPath + '/:' + crawlExecutionIdParam;
    const crawlExecutionSchema = z.object({
        start: z.string().datetime(),
        end: z.string().datetime(),
        sitesCrawled: z.number(),
        status: z.string().regex(new RegExp('^(finished)|(failed)$')),
    });
    app.get(crawlExecutionsPath, async (request, response) => {
        const executionController = createExecutionController(mongoClient);
        const executions = await executionController.getExecutions();
        response.json(executions);
        response.status(StatusCodes.OK);
    });

    app.post('/website-records/:websiteRecordId/crawl-executions', async (request, response) => {
        const executionController = createExecutionController(mongoClient);
        const executionId = await executionController.addExecution(request.params.websiteRecordId);
        if (executionId) {
            response.json({ id: executionId });
            response.status(StatusCodes.CREATED);
        } else {
            response.send(ReasonPhrases.BAD_REQUEST);
            response.status(StatusCodes.BAD_REQUEST);
        }
    });

    app.get('/website-records/:websiteRecordId/crawl-executions', async (request, response) => {
        const executionController = createExecutionController(mongoClient);
        const executions = await executionController.getExecutions();
        if (executions) {
            response.send(executions);
            response.status(StatusCodes.OK);
        } else {
            response.send(ReasonPhrases.NOT_FOUND);
            response.status(StatusCodes.NOT_FOUND);
        }
    });

    app.get('/website-records/:websiteRecordId/crawl-executions/:executionId', async (request, response) => {
        const executionController = createExecutionController(mongoClient);
        const execution = await executionController.getExecution(request.params.websiteRecordId, request.params.executionId);
        if (execution) {
            response.send(execution);
            response.status(StatusCodes.OK);
        } else {
            response.status(StatusCodes.NOT_FOUND);
            response.send(ReasonPhrases.NOT_FOUND);
        }
    });
}
