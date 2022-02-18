// import BaseDao from "../../integration/elastic/BaseDao";

import { BaseKnexDao, KnexConnector, KnexFilterParser } from "lisco";
import lodash, { groupBy } from "lodash";
export class CheckpointDao extends BaseKnexDao {
    constructor() {
        super();

        this.tableName = `zcheckpoints`;
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
     * Obtiene una lista con las posibles checkpoints de la aplicación.
     *
     * Su estructura será:
     * [
     *  {
     *      "checks": "xxx-yyy-zzz", //Lista de checkpoints separados por guiones donde los origenes estan a la izquierda de sus destinos
     *      "status": "error|sent" //Estado del mensaje mas reciente encontrado
     *  }
     * ]
     * @param {*} filters
     * @returns
     */
    async getProcessedCheckpoints(filters) {
        const knex = KnexConnector.connection;

        let qry = knex
            .columns(["checks", knex.raw('(array_agg("status" ORDER BY "date_reception" DESC))[1] as status')]) //, knex.raw('(array_agg("status"))[1] as status')])
            .from(function () {
                this.columns([
                    "checks",
                    "status",
                    "date_reception",
                    // knex.raw(`string_agg("check_tag", '-' order by "check_date") as checks`),
                    // knex.raw('(array_agg("status" ORDER BY "check_date" DESC))[1] as status'),
                ])
                    // .from(self.tableName)
                    // .leftJoin(RELATION_TABLE, `${self.tableName}.check_message_id`, `${RELATION_TABLE}.message_id`)
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
            .groupBy(`nodetags.checks`);

        // console.log(qry.toSQL());
        return await qry;
    }

    /**
     * Subquery target_messages que se encarga de hacer join entre las tablas zmessages y zcheckpoints de forma que se
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
                    `${this.tableName}.check_tag`,
                    `${this.tableName}.check_message_id`,
                    `${this.tableName}.check_route_id`,
                    `${this.tableName}.check_channel_id`,
                    `${this.tableName}.check_date`,
                    `${RELATION_TABLE}.message_id`,
                    `${RELATION_TABLE}.date_reception`,
                    `${RELATION_TABLE}.date_processed`,
                    `${RELATION_TABLE}.status`,
                    `${RELATION_TABLE}.channel_name`,
                    `${RELATION_TABLE}.message_content_id`,
                    `${RELATION_TABLE}.message_content_type`,
                ]
            )
            .leftJoin(this.tableName, `${this.tableName}.check_message_id`, `${RELATION_TABLE}.message_id`)

            .as("tagged_messages");

        if (sortByDate) {
            baseQry.orderByRaw(`${RELATION_TABLE}.date_reception`);
        }
        return baseQry;
    }

    /**
     * Realiza la obtencion de todas las posibles tags y agrupa sus posibles elementos de forma que cuente cuantos mensajes source y target tiene cada check
     *
     * @param {*} filters
     * @returns
     */
    async countAllNodes(filters) {
        const self = this;
        const knex = KnexConnector.connection;

        let qry = knex
            .select(knex.raw("'' as type, '' as code, '0' as sent, '0' as error"))
            .from("zcheckpoints") //Workaround para evitar problemas con groupby en unionall: https://github.com/knex/knex/issues/913#issuecomment-858803542
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
                        this.from("integration_config").select("code").where({ document_type: "checkpoint" }).as("tagsmaster");
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
                            // this.on("source_messages.checks", "LIKE", "code").orOn(
                            this.on("source_messages.checks", "LIKE", knex.raw("concat('%',code ,'-%')"));
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
                        this.from("integration_config").select("code").where({ document_type: "checkpoint" }).as("tagsmaster");
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
                            this.on("target_messages.checks", "LIKE", knex.raw("concat('%-',code ,'%')"));
                        }
                    )
                    .groupBy("code"),
            ]);


        // console.log(qry.toSQL());
        return await qry;
    }
}
