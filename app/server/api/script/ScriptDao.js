import { BaseKnexDao, KnexConnector } from "lisco";

export class ScriptDao extends BaseKnexDao {
    tableName = "script_config";
    getObjectMembers({ type, language }) {
        let knex = KnexConnector.connection;

        let res = knex("script_config")
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
            res = res.whereRaw("data -> ? ->> ? = ?", [
                "parent_type",
                "objectCode",
                type.objectCode,
            ]);
        }

        console.log(res.toSQL().toNative());

        return res;
    }
}
