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

    async getDocumentTypeItems(table, documentType) {
        let knex = KnexConnector.connection;
        return await knex(table).where({
            document_type: documentType,
        });
    }
    async getTableItems(table) {
        let knex = KnexConnector.connection;
        return await knex(table);
    }
}
