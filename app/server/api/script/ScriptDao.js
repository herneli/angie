import { BaseKnexDao, KnexConnector } from "lisco";

export class ScriptDao extends BaseKnexDao {
    tableName = "script_config";
    getMethods() {
        let knex = KnexConnector.connection;
        let res = knex
            .select("*")
            .from("script_config")
            .where({ document_type: "test", code: "c1" })
            .first();
        return res.then((xxx) => console.log(xxx));
    }
}
