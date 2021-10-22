import { BaseKnexDao, KnexConnector, KnexFilterParser } from "lisco";

import { v4 as uuid_v4 } from "uuid";
import moment from 'moment';
import lodash from 'lodash';
export class IntegrationDao extends BaseKnexDao {
    tableName = "integration"


    //Overwrite
    save(object) {
        if (!object.id) {
            object.id = uuid_v4();
        }

        if (!object.created_on) {
            object.created_on = moment().toISOString();
        }
        if (!object.last_updated) {
            object.last_updated = moment().toISOString();
        }
        return super.save(object);
    }

    update(id, object) {
        object.last_updated = moment().toISOString();
        return super.update(id, object);
    }


}