import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { getCrawledWebsitesCollection, getWebsiteRecordsCollection } from '../db-access';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export function addCrawledWebsitesApi(app: express.Express, mongoClient: MongoClient) {
    const crawledWebsitesParamsSchema = z.object({
        websiteRecords: z.array(z.string()),
    });

    app.get('/api/crawled-websites', async (request, response, next) => {
        try {
            console.log(request.query);
            const validationResult = crawledWebsitesParamsSchema.safeParse(request.query);
            if (!validationResult.success) {
                console.log(validationResult.error);
                response.status(StatusCodes.BAD_REQUEST);
                response.json(validationResult.error);
                return;
            }

            const websiteRecordIds = validationResult.data.websiteRecords.map((record) => record);
            const crawledWebsites = getCrawledWebsitesCollection(mongoClient);
            const websites = await crawledWebsites
                .find({ websiteRecordId: { $in: websiteRecordIds } })
                .project({ executionId: 0, _id: 0 })
                .toArray();
            // console.log('websites', websites);

            response.json(websites);
            response.status(StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    });

    const crawledWebsiteParamsSchema = z.object({
        url: z.string(),
    });
    app.get('/api/crawled-website', async (request, response, next) => {
        try {
            console.log(request.query);
            const validationResult = crawledWebsiteParamsSchema.safeParse(request.query);
            if (!validationResult.success) {
                console.log(validationResult.error);
                response.status(StatusCodes.BAD_REQUEST);
                response.json(validationResult.error);
                return;
            }

            const crawledWebsites = getCrawledWebsitesCollection(mongoClient);
            const recordsCrawledWebsite = (
                await crawledWebsites.find({ url: validationResult.data.url }).project({ websiteRecordId: 1 }).toArray()
            ).map((id) => new ObjectId(id.websiteRecordId));

            const websiteRecordCollection = getWebsiteRecordsCollection(mongoClient);
            const websiteRecords = await websiteRecordCollection
                .find({ _id: { $in: recordsCrawledWebsite } })
                .project({ executions: 0 })
                .map((record) => {
                    record.id = record._id;
                    delete record._id;
                    return record;
                })
                .toArray();
            console.log(websiteRecords);
            response.json(websiteRecords);
            response.status(StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    });
}
