import { graphqlHTTP } from 'express-graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLID, GraphQLNonNull, GraphQLBoolean } from 'graphql';
import { getCrawledWebsitesCollection, getWebsiteRecordsCollection } from '../db-access';
import { MongoClient, ObjectId } from 'mongodb';
import { CrawlRecordWithOwner } from '../crawling-executor/crawling-execution';
import { WebsiteRecord } from '../website-record';
import { IdEntity } from '../base-types';
export function createGraphQLSchema(mongoClient: MongoClient) {
    const recordsCollection = getWebsiteRecordsCollection(mongoClient);
    const crawledWebsites = getCrawledWebsitesCollection(mongoClient);

    const WebPageType = new GraphQLObjectType({
        name: 'WebPage',
        fields: {
            identifier: { type: GraphQLNonNull(GraphQLID) },
            label: { type: GraphQLNonNull(GraphQLString) },
            url: { type: GraphQLNonNull(GraphQLString) },
            regexp: { type: GraphQLNonNull(GraphQLString) },
            tags: { type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLString))) },
            active: { type: GraphQLNonNull(GraphQLBoolean) },
        },
    });

    const NodeType: any = new GraphQLObjectType({
        name: 'Node',
        fields: () => ({
            title: { type: GraphQLString },
            url: { type: GraphQLNonNull(GraphQLString) },
            crawlTime: { type: GraphQLString },
            links: {
                type: GraphQLNonNull(GraphQLList(GraphQLNonNull(NodeType))),
                resolve: async (parent, params) => {
                    const nodes = (await crawledWebsites
                        .find({ url: { $in: parent.links } })
                        .project({ _id: 0 })
                        .toArray()) as CrawlRecordWithOwner[];
                    return nodes.map((node) => {
                        return {
                            title: node.title,
                            url: node.url,
                            crawlTime: node.crawlTime,
                            links: node.links,
                            owner: node.websiteRecordId,
                        };
                    });
                },
            },
            owner: {
                type: GraphQLNonNull(WebPageType),
                resolve: async (parent, params) => {
                    const webpage: any = await recordsCollection.findOne(
                        { _id: new ObjectId(parent.owner) },
                        { projection: { executions: 0, lastExecution: 0 } }
                    );
                    return {
                        identifier: webpage._id,
                        label: webpage.label,
                        url: webpage.url,
                        regexp: webpage.boundaryRegExp,
                        tags: webpage.tags,
                        active: webpage.active,
                    };
                },
            },
        }),
    });

    const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',
            fields: {
                websites: {
                    type: GraphQLNonNull(GraphQLList(GraphQLNonNull(WebPageType))),
                    resolve: async (parent, params) => {
                        const webpages = (await recordsCollection
                            .find()
                            .project({ executions: 0, lastExecution: 0 })
                            .map((record) => {
                                record.id = record._id;
                                delete record._id;
                                return record;
                            })
                            .toArray()) as (WebsiteRecord & IdEntity)[];
                        return webpages.map((webpage) => {
                            return {
                                identifier: webpage.id,
                                label: webpage.label,
                                url: webpage.url,
                                regexp: webpage.boundaryRegExp,
                                tags: webpage.tags,
                                active: webpage.active,
                            };
                        });
                    },
                },
                nodes: {
                    type: GraphQLNonNull(GraphQLList(GraphQLNonNull(NodeType))),
                    args: {
                        webPages: { type: GraphQLList(GraphQLNonNull(GraphQLID)) },
                    },
                    resolve: async (parent, params) => {
                        const nodes = (await crawledWebsites
                            .find({ url: { $in: params.webPages } })
                            .project({ executionId: 0, _id: 0 })
                            .toArray()) as CrawlRecordWithOwner[];
                        return nodes.map((node) => {
                            return {
                                title: node.title,
                                url: node.url,
                                crawlTime: node.crawlTime,
                                links: node.links,
                                owner: node.websiteRecordId,
                            };
                        });
                    },
                },
            },
        }),
    });
    return schema;
}
