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
        const columns = [
            `${this.tableName}.message_id`,
            `${this.tableName}.status`,
            `${this.tableName}.date_reception`,
            `${this.tableName}.date_processed`,
            `${this.tableName}.channel_id`,
            `${this.tableName}.channel_name`,
            `${this.tableName}.message_content_id`,
            `${this.tableName}.message_content_type`,
            `${this.tableName}.error_cause`,
            `${this.tableName}.error_stack`,
            `${this.tableName}.meta`,
        ];

        const self = this;
        return knex
            .from(function () {
                this.columns(columns)
                    .from(self.tableName)
                    .leftJoin(RELATION_TABLE, `${self.tableName}.message_id`, `${RELATION_TABLE}.tag_message_id`)
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
        const columns = [
            `${this.tableName}.message_id`,
            `${this.tableName}.status`,
            `${this.tableName}.date_reception`,
            `${this.tableName}.date_processed`,
            `${this.tableName}.channel_id`,
            `${this.tableName}.channel_name`,
            `${this.tableName}.message_content_id`,
            `${this.tableName}.message_content_type`,
            `${this.tableName}.error_cause`,
            `${this.tableName}.error_stack`,
            `${this.tableName}.meta`,
        ];

        const self = this;
        let data = await knex
            .from(function () {
                this.columns(columns)
                    .from(self.tableName)
                    .leftJoin(RELATION_TABLE, `${self.tableName}.message_id`, `${RELATION_TABLE}.tag_message_id`)
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
    getChannelMessages(channelId, filters) {
        //TODO: añadir búsqueda y ordenación
        const { start = 0, limit = 10 } = filters;
        delete filters.start;
        delete filters.limit;

        if (!filters.sort || !filters.sort.direction) {
            filters.sort = {
                field: "date_reception",
                direction: "descend",
            };
        }

        this.tableName = `zmessages_${channelId}`;

        return this.loadFilteredData(filters, start, limit);
    }

    getMessageTraces(channelId, messageId) {
        this.tableName = `zstats_${channelId}`;

        const filter = {
            ["breadcrumb_id"]: messageId,
            sort: {
                field: "date_time",
                direction: "ascend",
            },
        };

        return this.loadFilteredData(filter);
    }

    async getChannelMessageCount(channelId) {
        const knex = KnexConnector.connection;
        this.tableName = `zmessages`;
        const messages = { total: 0, error: 0, sent: 0 };

        //Los filtros se establecen manualmente al ser estáticos y utilizarse directamente el método search()
        const query = `select count(*) as "total",
                              count(case WHEN status = 'error' then 1 ELSE NULL END) as "error"
                        from zmessages
                        where channel_id = '${channelId}'`;

        try {
            const response = await knex.raw(query);
            const responseData = (response.rows && response.rows[0]) || false;

            if (responseData) {
                messages.total = responseData.total || 0;
                messages.error = responseData.error || 0;
                messages.sent = messages.total - messages.error;
            }
        } catch (e) {
            if (e.body && e.body.status === 404) {
                // console.log("Canal sin mensajes");
            } else {
                console.error("Error de conexión con Elastic:");
                console.error(e);
                return false;
            }
        }
        return messages;
    }
}
