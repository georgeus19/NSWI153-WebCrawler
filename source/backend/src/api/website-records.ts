import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { getWebsiteRecordsCollection } from '../db-access';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { createWebsiteRecordController } from '../controllers/website-records-controller';
import { PaginationParams, WebsiteRecord, WebsiteRecordFilterParams, WebsiteRecordSortParams } from '../website-record';
import { CrawlingExecutor } from '../crawling-executor/executor';

export function addWebsiteRecordsApi(app: express.Express, mongoClient: MongoClient, crawlingExecutor: CrawlingExecutor) {
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

    // const websiteRecordParamsSchema = z.object({
    //     pagination: z.object({ skip: z.number(), limit: z.number() }).optional(),
    //     sort: z.object({ lastExecutionFirst: z.boolean().optional(), urlAscending: z.boolean().optional() }).optional(),
    //     filter: z.object({ url: z.string().optional(), label: z.string().optional(), tags: z.array(z.string()).optional() }).optional(),
    // });

    const websiteRecordParamsSchema = z
        .object({
            skip: z.coerce.number().nonnegative().optional(), // z.preprocess(s => parseInt(z.string().parse(s), 10)) z.string().regex(/^d+$/).transform(Number).optional(),
            limit: z.coerce.number().positive().optional(),
            lastExecutionFirst: z.boolean().optional(),
            urlAscending: z.boolean().optional(),
            url: z.string().optional(),
            label: z.string().optional(),
            tags: z.array(z.string()).optional(),
        })
        .refine((schema) => (schema.skip && schema.limit) || (!schema.skip && !schema.limit))
        .refine(
            (schema) =>
                (schema.lastExecutionFirst && !schema.urlAscending) ||
                (!schema.lastExecutionFirst && schema.urlAscending) ||
                (!schema.lastExecutionFirst && !schema.urlAscending)
        );

    const websiteRecordController = createWebsiteRecordController(mongoClient, crawlingExecutor);
    app.get(websiteRecordsPath, async (request, response) => {
        console.log(request.query);
        const validationResult = websiteRecordParamsSchema.safeParse(request.query);
        if (!validationResult.success) {
            console.log(validationResult.error);
            response.status(StatusCodes.BAD_REQUEST);
            response.json(validationResult.error);
            return;
        }
        const pagination: PaginationParams | undefined = validationResult.data.skip
            ? { skip: validationResult.data.skip, limit: validationResult.data.limit! }
            : undefined;
        const filter: WebsiteRecordFilterParams | undefined =
            validationResult.data.url || validationResult.data.label || (validationResult.data.tags && validationResult.data.tags.length > 0)
                ? { url: validationResult.data.url, label: validationResult.data.label, tags: validationResult.data.tags }
                : undefined;
        const sort: WebsiteRecordSortParams | undefined =
            validationResult.data.lastExecutionFirst || validationResult.data.urlAscending
                ? { lastExecutionFirst: validationResult.data.lastExecutionFirst, urlAscending: validationResult.data.urlAscending }
                : undefined;
        const records = await websiteRecordController.getWebsiteRecords({ pagination: pagination, filter: filter, sort: sort });

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
        if (await websiteRecordController.deleteAllWebsiteRecords()) {
            response.status(StatusCodes.NO_CONTENT);
        } else {
            response.status(StatusCodes.BAD_REQUEST);
            response.send(ReasonPhrases.BAD_REQUEST);
        }
    });

    app.get(websiteRecordPath, async (request, response) => {
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
        if (await websiteRecordController.deleteWebsiteRecord(websiteRecordId)) {
            response.status(StatusCodes.NO_CONTENT);
        } else {
            response.status(StatusCodes.BAD_REQUEST);
        }
    });
}
