// import BaseDao from "../../integration/elastic/BaseDao";

import { BaseKnexDao, KnexConnector, KnexFilterParser } from "lisco";
import lodash, { groupBy } from "lodash";
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
        const knex = KnexConnector.connection;

        const RELATION_TABLE = "zmessages";
        return knex
            .from(RELATION_TABLE)
            .columns([
                `${this.tableName}.tag`,
                `${RELATION_TABLE}.date_reception`,
                `${RELATION_TABLE}.date_processed`,
                `${RELATION_TABLE}.status`,
                `${RELATION_TABLE}.channel_name`,
                `${RELATION_TABLE}.message_content_id`,
                `${RELATION_TABLE}.message_content_type`,
            ])
            .leftJoin(this.tableName, `${this.tableName}.tag_message_id`, `${RELATION_TABLE}.message_id`)
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .orderByRaw(sorts)
            .limit(limit)
            .offset(start);
    }

    async countFilteredData(filters) {
        const knex = KnexConnector.connection;

        const RELATION_TABLE = "zmessages";
        const self = this;

        let data = await knex
            .from(RELATION_TABLE)
            .columns([
                `${this.tableName}.tag`,
                `${RELATION_TABLE}.date_reception`,
                `${RELATION_TABLE}.date_processed`,
                `${RELATION_TABLE}.status`,
                `${RELATION_TABLE}.channel_name`,
                `${RELATION_TABLE}.message_content_id`,
                `${RELATION_TABLE}.message_content_type`,
            ])
            .leftJoin(self.tableName, `${self.tableName}.tag_message_id`, `${RELATION_TABLE}.message_id`)
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .count(`*`, { as: "total" });

        return data && data[0] ? data[0].total : 0;
    }

    async getProcessedTags(filters) {
        const knex = KnexConnector.connection;
        const columns = [knex.raw(`string_agg("tag", '-' order by "tag_date") as datatags`)];

        const RELATION_TABLE = "zmessages";
        const self = this;

        let qry = knex
            .from(function () {
                this.from(RELATION_TABLE)
                    .columns(columns)
                    .leftJoin(self.tableName, `${self.tableName}.tag_message_id`, `${RELATION_TABLE}.message_id`)
                    .where((builder) =>
                        KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
                    )
                    .groupBy(`message_id`)
                    .as("nodetags");
            })
            .groupBy(`nodetags.datatags`);

        // console.log(qry.toSQL());
        return await qry;
    }

    async countMessagesByConnection(filters, connection) {
        const knex = KnexConnector.connection;

        const RELATION_TABLE = "zmessages";
        const self = this;
        let qry = knex
            .columns([
                "datatags",
                knex.raw("count(CASE WHEN status = 'sent' THEN 1 ELSE NULL END) as sent"),
                knex.raw("count(CASE WHEN status = 'error' THEN 1 ELSE NULL END) as error"),
                knex.raw("(array_agg(status))[1] as last_status"),
            ])
            .from(function () {
                this.columns([knex.raw(`string_agg("tag", '-' order by "tag_date") as datatags`), `status`])
                    .from(RELATION_TABLE)
                    .leftJoin(self.tableName, `${self.tableName}.tag_message_id`, `${RELATION_TABLE}.message_id`)
                    .where((builder) =>
                        KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
                    )
                    .groupBy(`message_id`, `status`)
                    .as("nodetags");
            })
            .where("nodetags.datatags", "LIKE", `%${connection}%`)
            .groupBy(`nodetags.datatags`);

        // console.log(qry.toSQL());
        return await qry;
    }

    async countMessagesByNode(filters, node) {
        const knex = KnexConnector.connection;

        const RELATION_TABLE = "zmessages";
        const self = this;
        let data = await knex
            .columns([
                knex.raw("'source' as type"),
                knex.raw("count(CASE WHEN status = 'sent' THEN 1 ELSE NULL END) as sent"),
                knex.raw("count(CASE WHEN status = 'error' THEN 1 ELSE NULL END) as error"),
            ])
            .from(function () {
                this.columns([knex.raw(`string_agg("tag", '-' order by "tag_date") as datatags`), `status`])
                    .from(RELATION_TABLE)
                    .leftJoin(self.tableName, `${self.tableName}.tag_message_id`, `${RELATION_TABLE}.message_id`)
                    .where((builder) =>
                        KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
                    )
                    .groupBy(`message_id`, `status`)
                    .as("nodetags");
            })
            .where("nodetags.datatags", "LIKE", `${node}`)
            .orWhere("nodetags.datatags", "LIKE", `%${node}-%`)
            .unionAll([this.getTargetQuery(filters, node)]);

        return data;
    }

    getTargetQuery(filters, node) {
        const knex = KnexConnector.connection;

        const RELATION_TABLE = "zmessages";
        const self = this;

        return knex
            .columns([
                knex.raw("'target' as type"),
                knex.raw("count(CASE WHEN status = 'sent' THEN 1 ELSE NULL END) as sent"),
                knex.raw("count(CASE WHEN status = 'error' THEN 1 ELSE NULL END) as error"),
            ])
            .from(function () {
                this.columns([knex.raw(`string_agg("tag", '-' order by "tag_date") as datatags`), `status`])
                    .from(RELATION_TABLE)
                    .leftJoin(self.tableName, `${self.tableName}.tag_message_id`, `${RELATION_TABLE}.message_id`)
                    .where((builder) =>
                        KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
                    )
                    .groupBy(`message_id`, `status`)
                    .as("nodetags");
            })
            .where("nodetags.datatags", "LIKE", `%-${node}%`);
    }

    // getTaggedMessagesQuery(baseQry, columns, sortByDate) {
    //     const RELATION_TABLE = "zmessages";

    //     baseQry
    //         .from(RELATION_TABLE)
    //         .columns(
    //             columns || [
    //                 `${this.tableName}.tag`,
    //                 `${this.tableName}.message_id`,
    //                 `${this.tableName}.route_id`,
    //                 `${this.tableName}.channel_id`,
    //                 `${this.tableName}.date_reception`,
    //                 `${RELATION_TABLE}.date_reception as msg_date_reception`,
    //                 `${RELATION_TABLE}.date_processed`,
    //                 `${RELATION_TABLE}.status`,
    //                 `${RELATION_TABLE}.channel_name`,
    //                 `${RELATION_TABLE}.message_content_id`,
    //                 `${RELATION_TABLE}.message_content_type`,
    //             ]
    //         )
    //         .leftJoin(this.tableName, `${this.tableName}.message_id`, `${RELATION_TABLE}.message_id`)

    //         .as("tagged_messages");

    //     if (sortByDate) {
    //         baseQry.orderByRaw(`${RELATION_TABLE}.date_reception`);
    //     }
    // }

    async countAllNodes(filters) {
        const self = this;
        const knex = KnexConnector.connection;

        let data = await knex
            .select(knex.raw("'' as type, '' as code, '0' as sent, '0' as error"))
            .from("ztags") //Workaround para evitar problemas con groupby en unionall: https://github.com/knex/knex/issues/913#issuecomment-858803542
            .whereRaw("0 = 1")
            .unionAll([
                knex
                    .columns([
                        knex.raw("'source' as type"),
                        "code",
                        knex.raw("count(CASE WHEN source_messages.status = 'sent' THEN 1 ELSE NULL END) as sent"),
                        knex.raw("count(CASE WHEN source_messages.status = 'error' THEN 1 ELSE NULL END) as error"),
                    ])
                    .from(function () {
                        this.from("integration_config").select("code").where({ document_type: "tag" }).as("tagsmaster");
                    })
                    .leftJoin(
                        function () {
                            this.columns([
                                knex.raw('string_agg("ztags"."tag", \'-\' order by "ztags"."tag_date") as datatags'),
                                "zmessages.status",
                            ])
                                .from("zmessages")
                                .leftJoin("ztags", "zmessages.message_id", "ztags.tag_message_id")
                                .where((builder) =>
                                    KnexFilterParser.parseFilters(
                                        builder,
                                        lodash.omit(filters, ["sort", "start", "limit"])
                                    )
                                )
                                .groupBy(`zmessages.message_id`)
                                .orderBy("zmessages.date_reception")
                                .as("source_messages");
                        },
                        function () {
                            this.on("source_messages.datatags", "LIKE", "code").orOn(
                                "source_messages.datatags",
                                "LIKE",
                                knex.raw("concat('%',code ,'-%')")
                            );
                        }
                    )
                    .groupBy("code"),
                knex
                    .columns([
                        knex.raw("'target' as type"),
                        "code",
                        knex.raw("count(CASE WHEN target_messages.status = 'sent' THEN 1 ELSE NULL END) as sent"),
                        knex.raw("count(CASE WHEN target_messages.status = 'error' THEN 1 ELSE NULL END) as error"),
                    ])
                    .from(function () {
                        this.from("integration_config").select("code").where({ document_type: "tag" }).as("tagsmaster");
                    })
                    .leftJoin(
                        function () {
                            this.columns([
                                knex.raw('string_agg("ztags"."tag", \'-\' order by "ztags"."tag_date") as datatags'),
                                "zmessages.status",
                            ])
                                .from("zmessages")
                                .leftJoin("ztags", "zmessages.message_id", "ztags.tag_message_id")
                                .where((builder) =>
                                    KnexFilterParser.parseFilters(
                                        builder,
                                        lodash.omit(filters, ["sort", "start", "limit"])
                                    )
                                )
                                .groupBy(`zmessages.message_id`)
                                .orderBy("zmessages.date_reception")
                                .as("target_messages");
                        },
                        function () {
                            this.on("target_messages.datatags", "LIKE", knex.raw("concat('%-',code ,'%')"));
                        }
                    )
                    .groupBy("code"),
            ]);

        // let data =
        //     await knex.raw(`SELECT 'source' as type, code, count(CASE WHEN source_messages.status = 'sent' THEN 1 ELSE NULL END) as sent, count(CASE WHEN source_messages.status = 'error' THEN 1 ELSE NULL END) as error
        //     FROM (SELECT code FROM integration_config WHERE document_type = 'tag') as tagsMaster

        //     LEFT JOIN (select string_agg("ztags"."tag", '-' order by "ztags"."date_reception") as datatags, "zmessages"."status"
        //       from "zmessages"
        //       left join "ztags" on "ztags"."message_id" = "zmessages"."message_id"
        //       group by "zmessages"."message_id" order by zmessages.date_reception) as source_messages
        //     ON "source_messages"."datatags" like code or "source_messages"."datatags" like concat('%',code,'-%')

        //     group by code
        //     UNION ALL
        //     SELECT 'target' as type,  code, count(CASE WHEN target_messages.status = 'sent' THEN 1 ELSE NULL END) as sent, count(CASE WHEN target_messages.status = 'error' THEN 1 ELSE NULL END) as error
        //     FROM (SELECT code FROM integration_config WHERE document_type = 'tag') as tagsMaster

        //     LEFT JOIN (select string_agg("ztags"."tag", '-' order by "ztags"."date_reception") as datatags, "zmessages"."status"
        //       from "zmessages"
        //       left join "ztags" on "ztags"."message_id" = "zmessages"."message_id"
        //       group by "zmessages"."message_id" order by zmessages.date_reception) as target_messages
        //     ON "target_messages"."datatags" like concat('%-',code,'%')

        //     group by code
        //     order by code`);

        return data;
    }
}
