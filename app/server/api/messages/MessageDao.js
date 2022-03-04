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
        const RELATION_TABLE = "zcheckpoints";
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
            knex.raw(`string_agg("check_tag", '-'  order by "check_date") as checks`),
        ];

        const self = this;
        const qry = knex
            .from(function () {
                this.columns(columns)
                    .from(self.tableName)
                    .leftJoin(RELATION_TABLE, `${self.tableName}.message_id`, `${RELATION_TABLE}.check_message_id`)
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

        // console.log(qry.toSQL());
        return await qry;
    }

    async countFilteredDataTagged(filters, tagFilter) {
        const RELATION_TABLE = "zcheckpoints";
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
            knex.raw(`string_agg("check_tag", '-'  order by "check_date") as checks`),
        ];

        const self = this;
        let data = await knex
            .from(function () {
                this.columns(columns)
                    .from(self.tableName)
                    .leftJoin(RELATION_TABLE, `${self.tableName}.message_id`, `${RELATION_TABLE}.check_message_id`)
                    .groupBy(`${self.tableName}.message_id`)
                    .where((builder) =>
                        KnexFilterParser.parseFilters(builder, lodash.omit(tagFilter, ["sort", "start", "limit"]))
                    )
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
        this.tableName = `message_counts`;
        const filter = { channel_id: channelId };
        const messages = { total: 0, error: 0, sent: 0 };

        try {
            const response = await this.loadFilteredData(filter, 0, 1000);
            if (response && response[0]) {
                messages.total = response[0].total || 0;
                messages.error = response[0].error || 0;
                messages.sent = messages.total - messages.error;
            }
        } catch (e) {
            console.error("Error de conexión con la base de datos: ");
            console.error(e);
            return false;
        }
        return messages;
    }
}
