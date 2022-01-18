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

    async getDocumentTypeItems(table, documentType, code, version) {
        let knex = KnexConnector.connection;
        return await knex(table).where({
            document_type: documentType,
            package_code: code,
            package_version: version,
        });
    }
    async getTableItems(table, code, version) {
        let knex = KnexConnector.connection;
        return await knex(table).where({ package_code: code, package_version: version });
    }

    async updatePackageVersionStatus(code, version, data) {
        let knex = KnexConnector.connection;
        return knex("package_version")
            .insert({
                code: code,
                version: version,
                ...data,
            })
            .onConflict(["code", "version"])
            .merge()
            .returning("*");
    }
}
