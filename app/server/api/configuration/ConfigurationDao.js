import { BaseKnexDao, KnexConnector } from "lisco";

export class ConfigurationDao extends BaseKnexDao {
    tableName = "script_config";

    getModel(code) {
        let knex = KnexConnector.connection;
        let res = knex
            .select("*")
            .from("config_model")
            .where({ code: code })
            .first();
        return res;
    }

    getModelDataList(code) {
        let knex = KnexConnector.connection;
        return this.getModel(code).then((model) =>
            knex
                .select("*")
                .from(model.data.table)
                .where({ document_type: model.data.documentType })
        );
    }

    getModelData(code, id) {
        let knex = KnexConnector.connection;
        return this.getModel(code).then((model) =>
            knex
                .select("*")
                .from(model.data.table)
                .where({ document_type: model.data.documentType, id: id })
                .first()
        );
    }

    createModelData(code, data) {
        let knex = KnexConnector.connection;

        return this.getModel(code).then((model) => {
            let entity = {
                document_type: model.data.documentType,
                code: data.code,
                data: data,
            };
            return knex(model.data.table).insert(entity).returning("*");
        });
    }

    updateModelData(code, id, data) {
        let knex = KnexConnector.connection;

        return this.getModel(code).then((model) => {
            let entity = {
                document_type: model.documentType,
                code: data.code,
                id: data.id,
                data: data,
            };
            return knex(model.data.table)
                .where({
                    id: id,
                    document_type: model.data.documentType,
                })
                .update(entity)
                .returning("*");
        });
    }

    deleteModelData(code, id) {
        let knex = KnexConnector.connection;
        return this.getModel(code).then((model) =>
            knex(model.data.table)
                .where({ document_type: model.data.documentType, id: id })
                .delete()
        );
    }
}
