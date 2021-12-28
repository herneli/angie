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

    async loadByCode(objectId) {
        let knex = KnexConnector.connection;
        const data = await knex.from(this.tableName).where('code', objectId);

        if (data && data[0]) {
            return data[0];
        }
        return null;
    }
}
