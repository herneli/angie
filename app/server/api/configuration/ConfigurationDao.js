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

    getModelData(code, id) {
        let knex = KnexConnector.connection;
        return this.getModel(code).then((model) =>
            knex.select("*").from(model.data.table).where({ document_type: model.data.documentType, id: id }).first()
        );
    }
}
