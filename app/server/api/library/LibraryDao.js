import { BaseKnexDao, KnexConnector } from "lisco";
import { v4 as uuid_v4 } from "uuid";

export class LibraryDao extends BaseKnexDao {
    tableName = "library";

    async updateAll(libraries) {
        await KnexConnector.connection.from(this.tableName).delete();

        for (const library of libraries) {
            await KnexConnector.connection
                .from(this.tableName)
                .insert({
                    id: uuid_v4(),
                    group_id: library.group_id,
                    artifact_id: library.artifact_id,
                    version: library.version
                });
        }
    }

}
