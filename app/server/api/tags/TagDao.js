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

        const self = this;
        return knex
            .from(function () {
                self.getTaggedMessagesQuery(this);
            })
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .orderByRaw(sorts)
            .limit(limit)
            .offset(start);
    }

    async countFilteredData(filters) {
        const knex = KnexConnector.connection;

        const self = this;
        let data = await knex
            .from(function () {
                self.getTaggedMessagesQuery(this);
            })
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .count(`*`, { as: "total" });

        return data && data[0] ? data[0].total : 0;
    }

    /**
     * Obtiene una lista con las posibles tags de la aplicación.
     *
     * Su estructura será:
     * [
     *  {
     *      "datatags": "xxx-yyy-zzz", //Lista de tags separados por guiones donde los origenes estan a la izquierda de sus destinos
     *      "status": "error|sent" //Estado del mensaje mas reciente encontrado
     *  }
     * ]
     * @param {*} filters
     * @returns
     */
    async getProcessedTags(filters) {
        const knex = KnexConnector.connection;

        let qry = knex
            .columns(["datatags", knex.raw('(array_agg("status" ORDER BY "date_reception" DESC))[1] as status')]) //, knex.raw('(array_agg("status"))[1] as status')])
            .from(function () {
                this.columns([
                    "datatags",
                    "status",
                    "date_reception",
                    // knex.raw(`string_agg("tag", '-' order by "tag_date") as datatags`),
                    // knex.raw('(array_agg("status" ORDER BY "tag_date" DESC))[1] as status'),
                ])
                    // .from(self.tableName)
                    // .leftJoin(RELATION_TABLE, `${self.tableName}.tag_message_id`, `${RELATION_TABLE}.message_id`)
                    // .from(function () {
                    //     self.getTaggedMessagesQuery(this);
                    // })
                    .from("tagged_messages")
                    .where((builder) =>
                        KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
                    )
                    // .groupBy(`message_id`)
                    .as("nodetags");
            })
            .groupBy(`nodetags.datatags`);

        // console.log(qry.toSQL());
        return await qry;
    }

    /**
     * Cuenta los mensajes de sent y error de una conexion concreta
     *
     * La conexion será un string pudiendo estar separado por guiones
     *
     * @param {*} filters
     * @param {*} connection
     * @returns
     */
    async countMessagesByConnection(filters, connection) {
        const knex = KnexConnector.connection;

        const self = this;
        let qry = knex
            .columns([
                "datatags",
                knex.raw("count(CASE WHEN status = 'sent' THEN 1 ELSE NULL END) as sent"),
                knex.raw("count(CASE WHEN status = 'error' THEN 1 ELSE NULL END) as error"),
                // knex.raw("(array_agg(status))[1] as last_status"),
            ])
            .from(function () {
                this.columns([knex.raw(`string_agg("tag", '-' order by "tag_date") as datatags`), `status`])
                    .from(function () {
                        self.getTaggedMessagesQuery(this);
                    })
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

    /**
     * Cuenta los mensajes de un nodo concreto
     *
     * @param {*} filters
     * @param {*} node
     * @returns
     */
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
                    .from(function () {
                        self.getTaggedMessagesQuery(
                            this,
                            [
                                `${self.tableName}.message_id`,
                                `${self.tableName}.date_reception`,
                                `${self.tableName}.tag`,
                                `${RELATION_TABLE}.status`,
                            ],
                            false
                        );
                    })
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

    /**
     * Query usada para obtener los contadores de los mensajes que target para un nodo
     *
     * @param {*} filters
     * @param {*} node
     * @returns
     */
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
                    .from(function () {
                        self.getTaggedMessagesQuery(
                            this,
                            [
                                `${self.tableName}.message_id`,
                                `${self.tableName}.date_reception`,
                                `${self.tableName}.tag`,
                                `${RELATION_TABLE}.status`,
                            ],
                            false
                        );
                    })
                    .where((builder) =>
                        KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
                    )
                    .groupBy(`message_id`, `status`)
                    .as("nodetags");
            })
            .where("nodetags.datatags", "LIKE", `%-${node}%`);
    }

    /**
     * Subquery target_messages que se encarga de hacer join entre las tablas zmessages y ztags de forma que se
     * permita su uso en multiples lugares como tagged_messages
     *
     *
     * @param {*} baseQry
     * @param {*} columns
     * @param {*} sortByDate
     * @returns
     */
    getTaggedMessagesQuery(baseQry, columns, sortByDate) {
        const RELATION_TABLE = "zmessages";

        baseQry
            .from(RELATION_TABLE)
            .columns(
                columns || [
                    `${this.tableName}.tag`,
                    `${this.tableName}.tag_message_id`,
                    `${this.tableName}.tag_route_id`,
                    `${this.tableName}.tag_channel_id`,
                    `${this.tableName}.tag_date`,
                    `${RELATION_TABLE}.message_id`,
                    `${RELATION_TABLE}.date_reception`,
                    `${RELATION_TABLE}.date_processed`,
                    `${RELATION_TABLE}.status`,
                    `${RELATION_TABLE}.channel_name`,
                    `${RELATION_TABLE}.message_content_id`,
                    `${RELATION_TABLE}.message_content_type`,
                ]
            )
            .leftJoin(this.tableName, `${this.tableName}.tag_message_id`, `${RELATION_TABLE}.message_id`)

            .as("tagged_messages");

        if (sortByDate) {
            baseQry.orderByRaw(`${RELATION_TABLE}.date_reception`);
        }
        return baseQry;
    }

    /**
     * Realiza la obtencion de todas las posibles tags y agrupa sus posibles elementos de forma que cuente cuantos mensajes source y target tiene cada tag
     *
     * @param {*} filters
     * @returns
     */
    async countAllNodes(filters) {
        const self = this;
        const knex = KnexConnector.connection;

        let qry = knex
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
                            this.from("tagged_messages")
                                .where((builder) =>
                                    KnexFilterParser.parseFilters(
                                        builder,
                                        lodash.omit(filters, ["sort", "start", "limit"])
                                    )
                                )
                                .as("source_messages");
                        },
                        function () {
                            // this.on("source_messages.datatags", "LIKE", "code").orOn(
                            this.on("source_messages.datatags", "LIKE", knex.raw("concat('%',code ,'-%')"));
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
                            this.from("tagged_messages")
                                .where((builder) =>
                                    KnexFilterParser.parseFilters(
                                        builder,
                                        lodash.omit(filters, ["sort", "start", "limit"])
                                    )
                                )
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

        // console.log(qry.toSQL());
        return await qry;
    }
}
