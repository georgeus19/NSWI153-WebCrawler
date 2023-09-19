import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { getWebsiteRecordsCollection } from '../db-access';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { createWebsiteRecordController } from '../controllers/website-records-controller';
import { PaginationParams, WebsiteRecord, WebsiteRecordFilterParams, SortParams, WebsiteRecordSortOption, AscOrDesc } from '../website-record';
import { CrawlingExecutor } from '../crawling-executor/executor';

export function addWebsiteRecordsApi(app: express.Express, mongoClient: MongoClient, crawlingExecutor: CrawlingExecutor) {
    const websiteRecordsPath = '/website-records';
    const websiteRecordIdParam = 'websiteRecordId';
    const websiteRecordPath = websiteRecordsPath + '/:' + websiteRecordIdParam;
    const websiteRecordSchema = z.object({
        // id: z.string().optional(),
        url: z.string().url(),
        boundaryRegExp: z.string(),
        periodicity: z.coerce.number().positive(),
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
            sortBy: z.string().regex(new RegExp('^(url)|(lastExecution)$')).optional(),
            asc: z.string().regex(new RegExp('^(asc)|(desc)$')).optional(),
            url: z.string().optional(),
            label: z.string().optional(),
            tags: z.array(z.string()).optional(),
        })
        .refine(
            (schema) =>
                (Object.hasOwn(schema, 'skip') && Object.hasOwn(schema, 'limit')) ||
                (!Object.hasOwn(schema, 'skip') && !Object.hasOwn(schema, 'limit'))
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
        const pagination: PaginationParams | undefined = Object.hasOwn(validationResult.data, 'skip')
            ? { skip: validationResult.data.skip!, limit: validationResult.data.limit! }
            : undefined;
        const filter: WebsiteRecordFilterParams | undefined =
            validationResult.data.url || validationResult.data.label || (validationResult.data.tags && validationResult.data.tags.length > 0)
                ? { url: validationResult.data.url, label: validationResult.data.label, tags: validationResult.data.tags }
                : undefined;
        const sort: SortParams | undefined = validationResult.data.sortBy
            ? {
                  sortBy: validationResult.data.sortBy as WebsiteRecordSortOption,
                  asc: (Object.hasOwn(validationResult.data, 'asc') ? validationResult.data.asc : 'asc') as AscOrDesc,
              }
            : undefined;
        console.log(validationResult.data);
        console.log(sort);
        const recordsResult = await websiteRecordController.getWebsiteRecords({ pagination: pagination, filter: filter, sort: sort });
        response.json({
            data: recordsResult.data,
            pagination: recordsResult.pagination,
        });
        response.status(StatusCodes.OK);
    });

    app.post(websiteRecordsPath, async (request, response) => {
        console.log(request.body);
        const validationResult = websiteRecordSchema.safeParse(request.body);
        if (!validationResult.success) {
            console.log(validationResult.error);
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
            response.send(ReasonPhrases.NO_CONTENT);
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
        const updatedRecord = await websiteRecordController.updateWebsiteRecord(request.params[websiteRecordIdParam], websiteRecord);
        if (updatedRecord) {
            response.json(updatedRecord);
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
            response.send(ReasonPhrases.NO_CONTENT);
        } else {
            response.status(StatusCodes.BAD_REQUEST);
            response.send(ReasonPhrases.BAD_REQUEST);
        }
    });
}
