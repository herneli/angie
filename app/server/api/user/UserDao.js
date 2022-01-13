import { BaseKnexDao, KnexConnector } from "lisco";

import { v4 as uuid_v4 } from "uuid";

export class UserDao extends BaseKnexDao {
    tableName = "users";

    //Overwrite
    save(object) {
        return super.save(object);
    }

    loadByUsername(username) {
        const knex = KnexConnector.connection;

        return knex.from(this.tableName).where({ code: username }).first();
    }
}
