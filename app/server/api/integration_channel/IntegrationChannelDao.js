import { BaseKnexDao, KnexConnector } from "lisco";

import { v4 as uuid_v4 } from "uuid";
import moment from "moment";
import lodash from "lodash";
export class IntegrationChannelDao extends BaseKnexDao {
    tableName = "integration_channel";

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
        return this.loadFilteredData(
            {
                integration_id: {
                    type: "exact",
                    value: integration,
                },
            },
            0,
            1000
        );
    }

    async saveOrUpdate(elm) {
        const model = ["id", "created_on", "last_updated", "name", "description", "version", "integration_id", "nodes", "enabled"];
        const existing = await super.loadById(elm.id);

        elm.last_updated = moment().toISOString();
        elm.version++;

        if (existing.length === 0) {
            return super.save(lodash.pick(elm, model));
        }
        return super.update(elm.id, lodash.pick(elm, model));
    }
}
