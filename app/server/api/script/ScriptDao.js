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

        if (type.type === "void" || type.type === "boolean") {
            return Promise.resolve([]);
        }
        // Select methods
        let methods = knex("script_config").where({
            document_type: "method",
        });

        if (type.type === "object") {
            methods = methods.whereRaw(
                "data ->> 'language' = ? and " +
                    "( (data -> 'parentType' ->> 'type' = ? and data -> 'parentType' ->> 'objectCode' = ? ) or data -> 'parentType' ->> 'type' = '$any')",
                [language, type.type, type.objectCode]
            );
        } else {
            methods = methods.whereRaw(
                "data ->> 'language' = ? and " +
                    "( data -> 'parentType' ->> 'type' = ? or data -> 'parentType' ->> 'type' = '$any')",
                [language, type.type]
            );
        }
        // console.log(methods.toSQL().toNative());
        return methods;
    }

    getScriptConfig(documentType, code) {
        let knex = KnexConnector.connection;
        return knex("script_config")
            .where({
                document_type: documentType,
                code: code,
            })
            .first();
    }

    saveScriptConfig(documentType, code, data) {
        let knex = KnexConnector.connection;
        return knex("script_config")
            .insert({
                document_type: documentType,
                code: code,
                data: data,
            })
            .onConflict(["document_type", "code"])
            .merge()
            .returning("*");
    }
}
