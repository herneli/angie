import { BaseKnexDao, KnexConnector } from "lisco";

export class TaskDao extends BaseKnexDao {
    tableName = "task";

    async getAllMaterializedViews() {
        return KnexConnector.connection.select("matviewname").from("pg_matviews");
    }

}
