import { BaseKnexDao, KnexConnector, KnexFilterParser } from "lisco";

import lodash from "lodash";
import { unpackFullCode } from "../script/utils";

export class ConfigurationDao extends BaseKnexDao {
    tableName = "script_config";

    async getModel(code) {
        let knex = KnexConnector.connection;
        let res = await knex.select("*").from("config_model").where({ code: code }).first();
        if (!res || !res.data) {
            throw "No model found";
        }
        this.tableName = res.data.table;
        return res;
    }

    async getModelDataByCode(code, docCode) {
        const [package_code, elCode] = unpackFullCode(docCode);

        let knex = KnexConnector.connection;

        const model = await this.getModel(code);
        if (model.data.relation_schema) {
            //Si esta relacionado con otra tabla, ejecutar el join correspondiente
            const condition = {};
            condition[`${model.data.table}.document_type`] = model.data.documentType;
            condition[`${model.data.table}.code`] = elCode;
            condition[`${model.data.table}.package_code`] = package_code;

            let qry = knex
                .select(knex.raw(model.data.selectQuery))
                .from(model.data.table)
                .groupBy(model.data.group_by)
                .where({ ...condition });

            if (model.data.relation_schema) {
                if (!Array.isArray(model.data.relation_schema)) {
                    relationParams = [model.data.relation_schema];
                }
                model.data.relation_schema.forEach((element) => {
                    qry = qry.joinRaw(element.type + " " + element.with_table + " ON " + element.on_condition);
                });
            }

            const elm = await qry.first();
            let relations = model.data.relation_schema || {};
            if (elm) {
                if (!Array.isArray(relations)) {
                    relations = [relations];
                }
                relations.forEach((relation) => {
                    elm.data[relation.relation_column] = elm[relation.relation_column];
                });
            }

            return elm;
        }
        return knex
            .select("*")
            .from(model.data.table)
            .where({ document_type: model.data.documentType, code: elCode, package_code })
            .first();
    }

    async getModelData(code, id) {
        let knex = KnexConnector.connection;

        const model = await this.getModel(code);
        if (model.data.relation_schema) {
            //Si esta relacionado con otra tabla, ejecutar el join correspondiente
            const condition = {};
            condition[`${model.data.table}.document_type`] = model.data.documentType;
            condition[`${model.data.table}.id`] = id;

            let qry = knex
                .select(knex.raw(model.data.selectQuery))
                .from(model.data.table)
                .groupBy(model.data.group_by)
                .where({ ...condition });

            if (model.data.relation_schema) {
                if (!Array.isArray(model.data.relation_schema)) {
                    relationParams = [model.data.relation_schema];
                }
                model.data.relation_schema.forEach((element) => {
                    qry = qry.joinRaw(element.type + " " + element.with_table + " ON " + element.on_condition);
                });
            }

            const elm = await qry.first();
            let relations = model.data.relation_schema || {};
            if (elm) {
                if (!Array.isArray(relations)) {
                    relations = [relations];
                }
                relations.forEach((relation) => {
                    elm.data[relation.relation_column] = elm[relation.relation_column];
                });
            }

            return elm;
        }
        return knex
            .select("*")
            .from(model.data.table)
            .where({ document_type: model.data.documentType, id: id })
            .first();
    }

    async loadFilteredDataWithRelations(filters, start, limit, relation_config) {
        let sorts = [];

        if (filters.sort) {
            sorts = KnexFilterParser.parseSort(filters.sort);
        } else {
            sorts = 1;
        }
        let qry = KnexConnector.connection
            .select(KnexConnector.connection.raw(relation_config.selectQuery))
            .from(this.tableName)
            .groupBy(relation_config.group_by)
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            );

        if (relation_config.relation_schema) {
            if (!Array.isArray(relation_config.relation_schema)) {
                relationParams = [relation_config.relation_schema];
            }
            relation_config.relation_schema.forEach((element) => {
                qry = qry.joinRaw(element.type + " " + element.with_table + " ON " + element.on_condition);
            });
        }

        return qry.orderByRaw(sorts).limit(limit).offset(start);
    }
}
