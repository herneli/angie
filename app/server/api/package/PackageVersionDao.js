import { BaseKnexDao, KnexConnector } from "lisco";

export class PackageVersionDao extends BaseKnexDao {
    tableName = "package_version";

    async getPackageVersionList(code) {
        let knex = KnexConnector.connection;
        return await knex("package_version").where({
            code: code,
        });
    }

    async getPackageVersion(code, version) {
        let knex = KnexConnector.connection;
        return await knex("package_version")
            .where({
                code: code,
                version: version,
            })
            .first();
    }
}
