// import BaseDao from "../../integration/elastic/BaseDao";

import { BaseKnexDao, KnexConnector, KnexFilterParser } from "lisco";
import lodash from "lodash";
export class TagDao extends BaseKnexDao {
    constructor() {
        super();

        this.tableName = `ztags`;
    }

    getWithMessages(identifiers) {
        const RELATION_TABLE = "zmessages";
        const knex = KnexConnector.connection;
        const columns = [
            `${this.tableName}.*`,
            `${RELATION_TABLE}.date_reception as msg_date_reception`,
            `${RELATION_TABLE}.date_processed`,
            `${RELATION_TABLE}.status`,
            `${RELATION_TABLE}.channel_id`,
            `${RELATION_TABLE}.channel_name`,
            `${RELATION_TABLE}.message_content_id`,
            `${RELATION_TABLE}.message_content_type`,
        ];

        return knex
            .columns(columns)
            .from(this.tableName)
            .leftJoin(RELATION_TABLE, `${this.tableName}.message_id`, `${RELATION_TABLE}.message_id`)
            .whereIn(`${this.tableName}.message_id`, identifiers)
            .groupBy(`${this.tableName}.tag, ${this.tableName}.message_id, ${this.tableName}.route_id`);
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

        return knex
            .columns(columns)
            .from(this.tableName)
            .leftJoin(RELATION_TABLE, `${this.tableName}.message_id`, `${RELATION_TABLE}.message_id`)
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

        let data = await knex
            .from(this.tableName)
            .leftJoin(RELATION_TABLE, `${this.tableName}.message_id`, `${RELATION_TABLE}.message_id`)
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .count(`${this.tableName}.*`, { as: "total" });

        return data ? data.total : 0;
    }
}
