import { BaseKnexDao, KnexConnector, KnexFilterParser } from "lisco";
import BaseDao from "../../integration/elastic/BaseDao";

import lodash from "lodash";

export class MessageDao extends BaseKnexDao {
    //extends BaseDao
    constructor() {
        super();

        this.tableName = `zmessages`;
    }

    async loadFilteredDataTagged(filters, start, limit, tagFilter) {
        let sorts = 1;
        if (filters.sort) {
            sorts = KnexFilterParser.parseSort(filters.sort);
        }
        const RELATION_TABLE = "ztags";
        const knex = KnexConnector.connection;
        const columns = [`${this.tableName}.*`, knex.raw(`string_agg("${RELATION_TABLE}"."tag", ',') as tags`)];

        const self = this;
        return knex
            .from(function () {
                this.columns(columns)
                    .from(self.tableName)
                    .leftJoin(RELATION_TABLE, `${self.tableName}.message_id`, `${RELATION_TABLE}.message_id`)
                    .groupBy(`${self.tableName}.message_id`)
                    .where((builder) =>
                        KnexFilterParser.parseFilters(builder, lodash.omit(tagFilter, ["sort", "start", "limit"]))
                    )
                    .as("tagged_messages");
            })
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .orderByRaw(sorts)
            .limit(limit)
            .offset(start);
    }

    async countFilteredDataTagged(filters, tagFilter) {
        const RELATION_TABLE = "ztags";
        const knex = KnexConnector.connection;
        const columns = [`${this.tableName}.*`, knex.raw(`string_agg("${RELATION_TABLE}"."tag", ',') as tags`)];

        const self = this;
        let data = await knex
            .from(function () {
                this.columns(columns)
                    .from(self.tableName)
                    .leftJoin(RELATION_TABLE, `${self.tableName}.message_id`, `${RELATION_TABLE}.message_id`)
                    .where((builder) =>
                        KnexFilterParser.parseFilters(builder, lodash.omit(tagFilter, ["sort", "start", "limit"]))
                    )
                    .groupBy(`${self.tableName}.message_id`)
                    .as("tagged_messages");
            })
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .count(`*`, { as: "total" });

        return data && data[0] ? data[0].total : 0;
    }

    async countFilteredData(filters) {
        let data = await KnexConnector.connection
            .from(this.tableName)
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .count("message_id", { as: "total" });

        return data && data[0].total;
    }

    // getChannelMessages(channelId, filters) {
    //     //TODO: añadir búsqueda y ordenación
    //     const { start = 0, limit = 10 } = filters;
    //     delete filters.start;
    //     delete filters.limit;

    //     if (!filters.sort || !filters.sort.direction) {
    //         filters.sort = {
    //             field: "date_reception",
    //             direction: "descend",
    //         };
    //     }

    //     this.tableName = `messages_${channelId}`;
    //     return this.loadAllData(filters, start, limit);
    // }

    // getMessageTraces(channelId, messageId) {
    //     const filter = {
    //         ["breadcrumb_id.keyword"]: messageId,
    //         sort: {
    //             field: "date_time",
    //             direction: "ascend",
    //         },
    //     };

    //     this.tableName = `stats_${channelId}`;
    //     // El limit en este caso debe ser alto para poder cargar todas las trazas que pueda tener un mensaje
    //     return this.loadAllData(filter, 0, 9999);
    // }

    // async getChannelMessageCount(channelId) {
    //     this.tableName = `stats_${channelId}`;
    //     //Los filtros se establecen manualmente al ser estáticos y utilizarse directamente el método search()
    //     const filters = {
    //         size: 0,
    //         body: {
    //             aggs: {
    //                 messages: {
    //                     cardinality: {
    //                         field: "breadcrumb_id.keyword",
    //                     },
    //                 },
    //                 errorMessages: {
    //                     filter: { term: { "event.keyword": "ERROR" } },
    //                     aggs: {
    //                         total: {
    //                             cardinality: {
    //                                 field: "breadcrumb_id.keyword",
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //     };

    //     const messages = { total: 0, error: 0, sent: 0 };

    //     try {
    //         const response = await this.search(filters);
    //         const responseData = response.body.aggregations || false;

    //         if (responseData) {
    //             messages.total = responseData.messages.value || 0;
    //             messages.error = responseData.errorMessages.total.value || 0;
    //             messages.sent = messages.total - messages.error;
    //         }
    //     } catch (e) {
    //         if (e.body && e.body.status === 404) {
    //             // console.log("Canal sin mensajes");
    //         } else {
    //             console.error("Error de conexión con Elastic:");
    //             console.error(e);
    //             return false;
    //         }
    //     }
    //     return messages;
    // }
}
