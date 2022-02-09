// import { BaseService } from "../../integration/elastic";
import axios from "axios";
import { BaseService } from "lisco";
import { ConfigurationService } from "../configuration/ConfigurationService";
import { TagDao } from "./";
import { JSONPath } from "jsonpath-plus";
export class TagService extends BaseService {
    constructor() {
        super(TagDao);
    }

    getWithMessages(identifiers) {
        return this.dao.loadFilteredData(
            {
                "ztags.message_id": {
                    type: "in",
                    value: identifiers,
                },
            },
            0,
            1000
        );
    }

    async healthcheck(identifier) {
        const confServ = new ConfigurationService();
        const { data: tagDefinition } = await confServ.getModelData("tag", identifier);

        if (!tagDefinition || !tagDefinition.healthcheck) {
            return null;
        }
        const { healthcheck } = tagDefinition;
        const response = {
            type: healthcheck.response_type,
        };
        switch (healthcheck.response_type) {
            case "alive":
                response.status = await this.aliveHealthcheck(healthcheck);
                break;
            case "data":
                response.value = await this.dataHealthCkeck(healthcheck);
                break;
            default:
                break;
        }
        return response;
    }

    async aliveHealthcheck(config) {
        try {
            const response = await axios({
                url: config.url,
                method: config.method || "GET",
            });
            //TODO parse response? check code¿
            return true;
        } catch (ex) {
            return false;
        }
    }
    async dataHealthCkeck(config) {
        try {
            const response = await axios({
                url: config.url,
                method: config.method || "GET",
            });

            return JSONPath({ path: config.response_property, json: response.data });
        } catch (ex) {
            return "-";
        }
    }
}
