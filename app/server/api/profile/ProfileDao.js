import { BaseKnexDao, KnexConnector } from "lisco";

import { v4 as uuid_v4 } from "uuid";

export class ProfileDao extends BaseKnexDao {
    tableName = "profile"


    //Overwrite
    save(object) {
        return super.save(object);
    }
}