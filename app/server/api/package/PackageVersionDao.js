import { BaseKnexDao, KnexConnector } from "lisco";
import { PackageDao } from "./PackageDao";

export class PackageVersionDao extends BaseKnexDao {
    tableName = "package_version";

    async getPackageVersionList(code) {
        let knex = KnexConnector.connection;
        return await knex("package_version")
            .where({
                code: code,
            })
            .orderBy("version");
    }

    async getPackageVersion(code, version) {
        const packageDao = new PackageDao();
        let knex = KnexConnector.connection;
        let packageVersion = await knex("package_version")
            .where({
                code: code,
                version: version,
            })
            .first();
        if (packageVersion) {
            packageVersion.packageData = await packageDao.getPackage(code);
        }
        return packageVersion;
    }

    async deletePackageVersion(code, version) {
        let knex = KnexConnector.connection;
        return await knex("package_version")
            .where({
                code: code,
                version: version,
            })
            .del();
    }

    async updatePackageDependencies(code, version, dependencies) {
        let knex = KnexConnector.connection;
        return await knex("package_version")
            .where({
                code: code,
                version: version,
            })
            .update("dependencies", JSON.stringify(dependencies));
    }

    async getDocumentTypeItems(table, documentType, package_code, package_version) {
        let knex = KnexConnector.connection;
        return await knex(table).where({
            document_type: documentType,
            package_code: package_code,
            package_version: package_version,
        });
    }
    async getTableItems(table, package_code, package_version) {
        let knex = KnexConnector.connection;
        return await knex(table).where({ package_code: package_code, package_version: package_version });
    }

    async deleteDocumentTypeItems(table, documentType, package_code, package_version) {
        let knex = KnexConnector.connection;
        return await knex(table)
            .where({
                document_type: documentType,
                package_code: package_code,
                package_version: package_version,
            })
            .del();
    }

    async deleteTableItems(table, package_code, package_version) {
        let knex = KnexConnector.connection;
        return await knex(table)
            .where({
                package_code: package_code,
                package_version: package_version,
            })
            .del();
    }

    async insertDocumentTypeItem(table, documentType, package_code, package_version, entry) {
        let knex = KnexConnector.connection;
        return await knex(table).insert({
            ...entry,
            document_type: documentType,
            package_code: package_code,
            package_version: package_version,
        });
    }

    async insertTableItem(table, package_code, package_version, entry) {
        let knex = KnexConnector.connection;
        return await knex(table).insert({
            ...entry,
            package_code: package_code,
            package_version: package_version,
        });
    }

    async createPackageVersion(data) {
        let knex = KnexConnector.connection;
        return await knex("package_version").insert(data);
    }

    async updatePackageVersionStatus(code, version, data) {
        let knex = KnexConnector.connection;
        return await knex("package_version")
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
