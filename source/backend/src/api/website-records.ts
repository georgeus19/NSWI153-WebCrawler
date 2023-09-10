import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { getWebsiteRecordsCollection } from '../db-access';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { createWebsiteRecordController } from '../controllers/website-records-controller';
import { WebsiteRecord } from '../website-record';
import { CrawlingExecutor } from '../crawling-executor/executor';

export function addWebsiteRecordsApi(app: express.Express, mongoClient: MongoClient, executor: CrawlingExecutor) {
    const websiteRecordsPath = '/website-records';
    const websiteRecordIdParam = 'websiteRecordId';
    const websiteRecordPath = websiteRecordsPath + '/:' + websiteRecordIdParam;
    const websiteRecordSchema = z.object({
        // id: z.string().optional(),
        url: z.string().url(),
        boundaryRegExp: z.string(),
        periodicity: z.number(),
        label: z.string(),
        active: z.boolean(),
        tags: z.array(z.string()),
        // executions: z.array(crawlExecutionSchema).optional(),
    });
    app.get(websiteRecordsPath, async (request, response) => {
        const websiteRecordController = createWebsiteRecordController(mongoClient);
        const records = await websiteRecordController.getWebsiteRecords();

        response.json(records);
        response.status(StatusCodes.OK);
    });

    app.post(websiteRecordsPath, async (request, response) => {
        console.log(request.body);
        const validationResult = websiteRecordSchema.safeParse(request.body);
        if (!validationResult.success) {
            response.status(StatusCodes.BAD_REQUEST);
            response.json(validationResult.error);
            return;
        }

        const websiteRecordController = createWebsiteRecordController(mongoClient);
        const websiteRecord: WebsiteRecord = validationResult.data;
        const recordId = await websiteRecordController.addWebsiteRecord(websiteRecord);

        if (recordId) {
            response.status(StatusCodes.CREATED);
            response.json({ id: recordId });
        } else {
            response.status(StatusCodes.BAD_REQUEST);
            response.send(ReasonPhrases.BAD_REQUEST);
        }
    });

    app.delete(websiteRecordsPath, async (request, response) => {
        const websiteRecordController = createWebsiteRecordController(mongoClient);
        if (await websiteRecordController.deleteAllWebsiteRecords()) {
            response.status(StatusCodes.NO_CONTENT);
        } else {
            response.status(StatusCodes.BAD_REQUEST);
            response.send(ReasonPhrases.BAD_REQUEST);
        }
    });

    app.get(websiteRecordPath, async (request, response) => {
        const websiteRecordController = createWebsiteRecordController(mongoClient);
        const websiteRecord = await websiteRecordController.getWebsiteRecord(request.params[websiteRecordIdParam]);
        if (websiteRecord) {
            response.status(StatusCodes.OK);
            response.json(websiteRecord);
        } else {
            response.status(StatusCodes.NOT_FOUND);
            response.send(ReasonPhrases.NOT_FOUND);
        }
    });

    app.put(websiteRecordPath, async (request, response) => {
        const validationResult = websiteRecordSchema.safeParse(request.body);
        if (!validationResult.success) {
            response.status(StatusCodes.BAD_REQUEST);
            response.json(validationResult.error);
            return;
        }

        const websiteRecord: WebsiteRecord = validationResult.data;
        const websiteRecordController = createWebsiteRecordController(mongoClient);
        const updateSuccessful = await websiteRecordController.updateWebsiteRecord(request.params[websiteRecordIdParam], websiteRecord);
        if (updateSuccessful) {
            response.json(websiteRecord);
            response.status(StatusCodes.OK);
        } else {
            response.send(ReasonPhrases.BAD_REQUEST);
            response.status(StatusCodes.BAD_REQUEST);
        }
    });

    app.delete(websiteRecordPath, async (request, response) => {
        const websiteRecordId: string = request.params[websiteRecordIdParam];
        const websiteRecordController = createWebsiteRecordController(mongoClient);
        if (await websiteRecordController.deleteWebsiteRecord(websiteRecordId)) {
            response.status(StatusCodes.NO_CONTENT);
        } else {
            response.status(StatusCodes.BAD_REQUEST);
        }
    });
}
