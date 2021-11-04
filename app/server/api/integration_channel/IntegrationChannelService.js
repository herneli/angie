import { Utils, BaseService } from "lisco";
import { CamelComponentService } from "../camel_component";
import { IntegrationChannelDao } from "./IntegrationChannelDao";

import Handlebars from "handlebars";
import lodash from "lodash";
import * as queryString from "query-string";
import { NodeTypeService } from "../node_type";
import { JumDao } from "../../integration/jum-angie";

export class IntegrationChannelService extends BaseService {
    constructor() {
        super(IntegrationChannelDao);

        Handlebars.registerHelper("safe", function (inputData) {
            return new Handlebars.SafeString(inputData);
        });
        Handlebars.registerHelper("querystring", function (inputData) {
            return new Handlebars.SafeString(!lodash.isEmpty(inputData) ? "?" + queryString.stringify(inputData) : "");
        });

        this.jumDao = new JumDao();
    }

    //Override
    async list(filters, start, limit) {
        let channels = await super.list(filters, start, limit);

        for (let channel of channels.data) {
            // let status = await this.jumDao.getRouteStatus(channel.id);

            channel.status = "UNDEPLOYED"; //status
        }
        return channels;
    }

    async convertToCamelId(identifier) {
        const channel = await this.dao.loadById(identifier);
        return this.convertChannelToCamel(channel[0]);
    }

    async convertChannelToCamel(channel) {
        if (!channel || !channel.nodes) {
            throw Error("Cannot parse empty channel or channel without nodes.");
        }

        const camelComponentService = new CamelComponentService();
        const { data: camel_components } = await camelComponentService.list();

        const nodeTypesService = new NodeTypeService();
        const { data: node_types } = await nodeTypesService.list();

        const nodes = lodash.cloneDeep(channel.nodes.list);

        let camelStr = "";
        for (const idx in nodes) {
            const element = nodes[idx];

            let type = lodash.find(node_types, { id: element.type_id });
            if (!type) continue;
            let camelComponent = lodash.find(camel_components, {
                id: type.camel_component_id,
            });

            if (camelComponent.xml_template) {
                const template = Handlebars.compile(camelComponent.xml_template);

                camelStr += template({
                    source: element.id,
                    target: element.links && element.links.length !== 0 ? lodash.map(element.links, "node_id") : ["empty"],
                    ...element.data,
                });
            }
        }

        return `<routes  xmlns=\"http://camel.apache.org/schema/spring\">${camelStr}</routes>`;
    }

    async getIntegrationChannels(integration) {
        const channels = await this.dao.getIntegrationChannels(integration);

        for (let channel of channels) {
            let response = await this.jumDao.getRouteStatus(channel.id);

            channel.status = response.status || "UNDEPLOYED"; //status
        }

        return { data: channels, total: channels.length };
    }

    async deployChannel(identifier) {
        const channel = await this.dao.loadById(identifier);

        let camelRoute = await this.convertChannelToCamel(channel[0]);
        const response = await this.jumDao.deployRoute(identifier, camelRoute);
        console.log(response);
        channel[0].status = "STARTED"; //TODO

        return channel;
    }

    async undeployChannel(identifier) {
        const channel = await this.dao.loadById(identifier);

        const response = await this.jumDao.undeployRoute(identifier);
        console.log(response);
        channel[0].status = "UNDEPLOYED"; //TODO

        return channel;
    }

    async channelLogs(identifier) {
        const channel = await this.dao.loadById(identifier);

        channel[0].logs = {}; //TODO

        return channel;
    }

    async channelStats(identifier) {
        const channel = await this.dao.loadById(identifier);

        channel[0].stats = {}; //TODO

        return channel;
    }
    async channelStatus(identifier) {
        const channel = await this.dao.loadById(identifier);

        channel[0].status = "UNDEPLOYED"; //TODO

        return channel;
    }

    saveOrUpdate(elm) {
        return this.dao.saveOrUpdate(elm);
    }
}
