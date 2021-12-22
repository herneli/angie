import { BaseKnexDao, KnexConnector } from "lisco";
import { unpackFullCode } from "./utils";
export class ScriptDao extends BaseKnexDao {
    tableName = "script_config";

    getObjectData({ type, packages }) {
        let knex = KnexConnector.connection;

        // Select properties
        if (type.type === "object") {
            const [package_code, code] = unpackFullCode(type.objectCode);
            let objectData = knex("script_config").where({
                package_code: package_code,
                document_type: "object",
                code: code,
            });
            if (packages) {
                objectData.whereIn(["package_code", "package_version"], packages);
            }
            return objectData.first();
        } else {
            return Promise.resolve(null);
        }
    }

    getMethods({ type, language, packages }) {
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
                    "( (data -> 'parentType' ->> 'type' = ? and data -> 'parentType' ->> 'objectCode' = ? ) or data -> 'parentType' ->> 'type' = '$any' or data -> 'parentType' ->> 'type' = '$anyObject')",
                [language, type.type, type.objectCode]
            );
        } else if (type.type === "array") {
            methods = methods.whereRaw(
                "data ->> 'language' = ? and " +
                    "( data -> 'parentType' ->> 'type' = ?  or data -> 'parentType' ->> 'type' = '$any')",
                [language, type.type]
            );
        } else {
            methods = methods.whereRaw(
                "data ->> 'language' = ? and " +
                    "( data -> 'parentType' ->> 'type' = ? or data -> 'parentType' ->> 'type' = '$any' or data -> 'parentType' ->> 'type' = '$anyPrimitive')",
                [language, type.type]
            );
        }
        // console.log(methods.toSQL().toNative());
        if (packages) {
            methods.whereIn(["package_code", "package_version"], packages);
        }
        return methods;
    }

    getScriptConfig(documentType, package_code, code, packages) {
        let knex = KnexConnector.connection;
        let query = knex("script_config").where({
            package_code: package_code,
            document_type: documentType,
            code: code,
        });
        if (packages) {
            query = query.whereIn(["package_code", "package_version"], packages);
        }
        return query.first();
    }

    saveScriptConfig(documentType, code, data) {
        let knex = KnexConnector.connection;
        return knex("script_config")
            .insert({
                document_type: documentType,
                code: code,
                data: { ...data, code: code },
            })
            .onConflict(["document_type", "code"])
            .merge()
            .returning("*");
    }
}
