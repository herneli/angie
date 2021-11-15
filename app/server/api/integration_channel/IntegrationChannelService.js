import { Utils, BaseService } from "lisco";

import Handlebars from "handlebars";
import lodash from "lodash";
import * as queryString from "query-string";
import { JumDao } from "../../integration/jum-angie";
import { ConfigurationService } from "../configuration/ConfigurationService";
import { IntegrationDao } from "../integration/IntegrationDao";

export class IntegrationChannelService {
    constructor() {
        Handlebars.registerHelper("safe", function (inputData) {
            return new Handlebars.SafeString(inputData);
        });
        Handlebars.registerHelper("querystring", function (inputData) {
            let data = inputData;
            if (Array.isArray(inputData)) {
                data = lodash.mapValues(lodash.keyBy(inputData, "code"), "value");
            }
            return new Handlebars.SafeString(!lodash.isEmpty(inputData) ? "?" + queryString.stringify(data) : "");
        });

        this.dao = new IntegrationDao();
        this.jumDao = new JumDao();
    }

    async findIntegrationChannel(integrationId, channel) {
        const [integration] = await this.dao.loadById(integrationId);
        return lodash.find(integration.data.channels, { id: channel });
    }

    async convertToCamelId(integration, channel) {
        const channelObj = await this.findIntegrationChannel(integration, channel);

        return this.convertChannelToCamel(channelObj);
    }

    async convertChannelToCamel(channel) {
        if (!channel || !channel.nodes) {
            throw Error("Cannot parse empty channel or channel without nodes.");
        }

        const configService = new ConfigurationService();
        const { data: camel_components } = await configService.list("camel_component");

        const { data: node_types } = await configService.list("node_type");

        const nodes = lodash.cloneDeep(channel.nodes.list);

        let camelStr = "";
        for (const idx in nodes) {
            const element = nodes[idx];

            let type = lodash.find(node_types, { id: element.type_id });
            if (!type) continue;
            let camelComponent = lodash.find(camel_components, {
                id: type.data.camel_component_id,
            });

            if (camelComponent.data.xml_template) {
                const template = Handlebars.compile(camelComponent.data.xml_template);

                camelStr += template({
                    source: element.id,
                    target:
                        element.links && element.links.length !== 0 ? lodash.map(element.links, "node_id") : ["empty"],
                    ...element.data,
                });
            }
        }

        return `<routes  xmlns=\"http://camel.apache.org/schema/spring\">${camelStr}</routes>`;
    }

    async deployChannel(integration, channelId) {
        const channel = await this.findIntegrationChannel(integration, channelId);

        let camelRoute = await this.convertChannelToCamel(channel);
        const response = await this.jumDao.deployRoute(channelId, camelRoute);

        console.log(response);

        return this.channelObjStatus(channel);
    }

    async undeployChannel(integration, channelId) {
        const channel = await this.findIntegrationChannel(integration, channelId);

        const response = await this.jumDao.undeployRoute(channelId);
        console.log(response);

        return this.channelObjStatus(channel);
    }

    async channelLogs(integration, channelId) {
        const channel = await this.findIntegrationChannel(integration, channelId);

        channel.logs = {}; //TODO

        return channel;
    }

    async channelStats(integration, channelId) {
        const channel = await this.findIntegrationChannel(integration, channelId);
        channel.stats = {}; //TODO

        return channel;
    }

    async channelStatus(integration, channelId) {
        let channel = await this.findIntegrationChannel(integration, channelId);
        return channelObjStatus(channel);
    }

    async channelObjStatus(channel) {
        let channStatus;
        try {
            channStatus = await this.jumDao.getRouteStatus(channel.id);
        } catch (ex) {
            console.error(ex);
        }
        channel.status = (channStatus && channStatus.status) || "UNDEPLOYED";
        channel.message_count = (channStatus && channStatus.messages_count) || 0;
        return channel;
    }
}
