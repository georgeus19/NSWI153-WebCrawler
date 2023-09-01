import express from 'express';
import { MongoClient } from 'mongodb';
import { getWebsiteRecordsCollection } from '../db-access';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';

interface WebsiteRecord {
    id: string;
    url: string;
    boundaryRegExp: string;
    periodicity: number;
    label: string;
    active: boolean;
    tags: string[];
}

export interface CrawlingExecution {
    start: string;
    end: string;
    sitesCrawled: number;
    status: CrawlingExecutionStatus;
}

export type CrawlingExecutionStatus = 'finished' | 'failed';

export function addWebsiteRecordsApi(app: express.Express, mongoClient: MongoClient) {
    const websiteRecordsPath = '/website-records';
    const websiteRecordPath = websiteRecordsPath + '/?id';
    const crawlExecutionSchema = z.object({
        start: z.string().datetime(),
        end: z.string().datetime(),
        sitesCrawled: z.number(),
        status: z.string().regex(new RegExp('^(finished)|(failed)$')),
    });
    const websiteRecordSchema = z.object({
        id: z.string().optional(),
        url: z.string().url(),
        boundaryRegExp: z.string(),
        periodicity: z.number(),
        label: z.string(),
        active: z.boolean(),
        tags: z.array(z.string()),
        executions: z.array(crawlExecutionSchema).optional(),
    });
    app.get(websiteRecordsPath, async (request, respose) => {
        const recordCollection = getWebsiteRecordsCollection(mongoClient);

        const cursor = recordCollection.find();
        // cursor.map((doc) => {
        //     doc.id = doc._id;
        //     return doc;
        // });
        // cursor.project({ _id: 0 });
        const xx = await cursor.toArray();
        // console.log(await xx)1;
        respose.json(xx);
        respose.status(StatusCodes.OK);
    });

    app.post(websiteRecordsPath, async (request, response) => {
        console.log(request.body);
        const websiteRecord = request.body;
        const validationResult = websiteRecordSchema.safeParse(websiteRecord);
        if (!validationResult.success) {
            response.status(StatusCodes.BAD_REQUEST);
            response.json(validationResult.error);
            return;
        }

        const recordCollection = getWebsiteRecordsCollection(mongoClient);
        const insertedDoc = await recordCollection.insertOne(websiteRecord);
        response.status(StatusCodes.CREATED);
        response.json({ id: insertedDoc.insertedId });
    });

    // app.put(websiteRecordsPath, (request, response) => {
    //     const websiteRecordsToAdd = JSON.parse(request.body);
    //     const validationResult = z.array(websiteRecordSchema).safeParse(websiteRecordsToAdd);
    //     if (!validationResult.success) {
    //         response.status(StatusCodes.BAD_REQUEST);
    //         return;
    //     }

    //     const recordCollection = getWebsiteRecordsCollection(mongoClient);
    //     recordCollection.deleteMany({});
    //     recordCollection.insertMany(websiteRecordsToAdd);
    //     response.status(StatusCodes.CREATED);
    //     response.send(ReasonPhrases.CREATED);
    // });

    app.delete(websiteRecordsPath, (request, response) => {
        const recordCollection = getWebsiteRecordsCollection(mongoClient);
        recordCollection.deleteMany({});
        response.status(StatusCodes.NO_CONTENT);
    });
}
