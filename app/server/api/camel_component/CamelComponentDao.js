import { BaseKnexDao, KnexConnector } from "lisco";

import { v4 as uuid_v4 } from "uuid";

export class CamelComponentDao extends BaseKnexDao {
    tableName = "camel_component"


    //Overwrite
    save(object) {
        if (!object.id) {
            object.id = uuid_v4();
        }
        return super.save(object);
    }
}