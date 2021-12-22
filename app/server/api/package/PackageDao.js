import { BaseKnexDao, KnexConnector } from "lisco";

export class PackageDao extends BaseKnexDao {
    tableName = "package";

    async getPackage(code, version) {
        let knex = KnexConnector.connection;
        return await knex("package")
            .where({
                code: code,
                version: version,
            })
            .first();
    }
}
