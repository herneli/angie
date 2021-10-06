import { BaseKnexDao, KnexConnector } from "lisco";

import { v4 as uuid_v4 } from "uuid";

export class NodeTypeDao extends BaseKnexDao {
    tableName = "node_type"


    //Overwrite
    save(object) {
        if (!object.id) {
            object.id = uuid_v4();
        }
        return super.save(object);
    }
}