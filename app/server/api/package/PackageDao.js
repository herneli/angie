import { BaseKnexDao, KnexConnector } from "lisco";
import { PackageVersionService } from "./PackageVersionService";

export class PackageDao extends BaseKnexDao {
    tableName = "package";

    async getPackageList() {
        let knex = KnexConnector.connection;
        let packageList = await knex("package");
        let packageVersionService = new PackageVersionService();
        let newPackageList = [];
        for (const packageData of packageList) {
            let packageVersions = await packageVersionService.getPackageVersionList(packageData.code);
            newPackageList.push({ ...packageData, versions: packageVersions });
        }
        return newPackageList;
    }

    async getPackage(code) {
        let knex = KnexConnector.connection;
        let packageData = await knex("package")
            .where({
                code: code,
            })
            .first();
        if (packageData) {
            let packageVersionService = new PackageVersionService();
            let packageVersions = await packageVersionService.getPackageVersionList(packageData.code);
            return { ...packageData, versions: packageVersions };
        }
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
