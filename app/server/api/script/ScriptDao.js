import { BaseKnexDao, KnexConnector } from "lisco";

export class ScriptDao extends BaseKnexDao {
    tableName = "script_config";

    getObjectData(type) {
        let knex = KnexConnector.connection;

        // Select properties
        if (type.type === "object") {
            let objectData = knex("script_config")
                .where({
                    document_type: "object",
                    code: type.objectCode,
                })
                .first();
            return objectData;
        } else {
            return Promise.resolve(null);
        }
    }

    getMethods(type, language) {
        let knex = KnexConnector.connection;

        // Select properties
        let objectData;

        // Select methods
        let methods = knex("script_config")
            .where({
                document_type: "method",
            })
            .whereRaw("data ->> ? = ? and data -> ? ->> ? = ?", [
                "language",
                language,
                "parent_type",
                "type",
                type.type,
            ]);

        if (type.type === "object") {
            methods = methods.whereRaw("data -> ? ->> ? = ?", [
                "parent_type",
                "objectCode",
                type.objectCode,
            ]);
        }

        return methods;
    }
}
