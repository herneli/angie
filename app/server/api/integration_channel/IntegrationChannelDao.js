import { BaseKnexDao, KnexConnector } from "lisco";

import { v4 as uuid_v4 } from "uuid";
import moment from 'moment';
export class IntegrationChannelDao extends BaseKnexDao {
    tableName = "integration_channel"


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


    getIntegrationChannels(integration) {
        return this.loadFilteredData({
            integration_id: {
                "type": "exact",
                "value": integration
            }
        }, 0, 1000);
    }
}