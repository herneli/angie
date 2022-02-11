// import BaseDao from "../../integration/elastic/BaseDao";

import { BaseKnexDao, KnexConnector, KnexFilterParser } from "lisco";
import lodash from "lodash";
export class TagDao extends BaseKnexDao {
    constructor() {
        super();

        this.tableName = `ztags`;
    }

    async loadFilteredData(filters, start, limit) {
        let sorts = 1;
        if (filters.sort) {
            sorts = KnexFilterParser.parseSort(filters.sort);
        }
        const RELATION_TABLE = "zmessages";
        const knex = KnexConnector.connection;
        const columns = [
            `${this.tableName}.*`,
            `${RELATION_TABLE}.date_reception as msg_date_reception`,
            `${RELATION_TABLE}.date_processed`,
            `${RELATION_TABLE}.status`,
            `${RELATION_TABLE}.channel_name`,
            `${RELATION_TABLE}.message_content_id`,
            `${RELATION_TABLE}.message_content_type`,
        ];

        const self = this;
        return knex
            .from(function () {
                this.columns(columns)
                    .from(self.tableName)
                    .leftJoin(RELATION_TABLE, `${self.tableName}.message_id`, `${RELATION_TABLE}.message_id`)
                    .as("tagged_messages");
            })
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .orderByRaw(sorts)
            .limit(limit)
            .offset(start);
    }

    async countFilteredData(filters) {
        const RELATION_TABLE = "zmessages";
        const knex = KnexConnector.connection;
        const columns = [
            `${this.tableName}.*`,
            `${RELATION_TABLE}.date_reception as msg_date_reception`,
            `${RELATION_TABLE}.date_processed`,
            `${RELATION_TABLE}.status`,
            `${RELATION_TABLE}.channel_name`,
            `${RELATION_TABLE}.message_content_id`,
            `${RELATION_TABLE}.message_content_type`,
        ];

        const self = this;
        let data = await knex
            .from(function () {
                this.columns(columns)
                    .from(self.tableName)
                    .leftJoin(RELATION_TABLE, `${self.tableName}.message_id`, `${RELATION_TABLE}.message_id`)
                    .as("tagged_messages");
            })
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .count(`*`, { as: "total" });

        return data && data[0] ? data[0].total : 0;
    }
}
