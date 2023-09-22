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
    app.get('/api/website-records-crawl-executions', async (request, response, next) => {
        try {
            const executionController = createExecutionController(mongoClient, executor);
            const executions = await executionController.getExecutions();
            response.json(executions);
            response.status(StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    });

    app.post('/api/website-records/:websiteRecordId/crawl-executions', async (request, response, next) => {
        try {
            const executionController = createExecutionController(mongoClient, executor);
            const execution = await executionController.addExecution(request.params.websiteRecordId);
            if (execution) {
                response.json(execution);
                response.status(StatusCodes.CREATED);
            } else {
                response.send(ReasonPhrases.BAD_REQUEST);
                response.status(StatusCodes.BAD_REQUEST);
            }
        } catch (error) {
            next(error);
        }
    });

    app.get('/api/website-records/:websiteRecordId/crawl-executions', async (request, response, next) => {
        try {
            const executionController = createExecutionController(mongoClient, executor);
            const executions = await executionController.getExecutions(request.params.websiteRecordId);
            if (executions) {
                response.send(executions);
                response.status(StatusCodes.OK);
            } else {
                response.send(ReasonPhrases.NOT_FOUND);
                response.status(StatusCodes.NOT_FOUND);
            }
        } catch (error) {
            next(error);
        }
    });

    app.get('/api/website-records/:websiteRecordId/crawl-executions/:executionId', async (request, response, next) => {
        try {
            const executionController = createExecutionController(mongoClient, executor);
            const execution = await executionController.getExecution(request.params.websiteRecordId, request.params.executionId);
            if (execution) {
                response.send(execution);
                response.status(StatusCodes.OK);
            } else {
                response.status(StatusCodes.NOT_FOUND);
                response.send(ReasonPhrases.NOT_FOUND);
            }
        } catch (error) {
            next(error);
        }
    });
}
