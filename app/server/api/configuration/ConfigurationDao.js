import { BaseKnexDao, KnexConnector } from "lisco";

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

            return qry.first();
        }
        return knex
            .select("*")
            .from(model.data.table)
            .where({ document_type: model.data.documentType, id: id })
            .first();
    }
}
