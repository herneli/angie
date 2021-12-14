import { Utils, BaseService } from "lisco";

import Handlebars from "handlebars";
import lodash from "lodash";
import * as queryString from "query-string";
import { JumDao } from "../../integration/jum-angie";
import { ConfigurationService } from "../configuration/ConfigurationService";
import { IntegrationDao } from "../integration/IntegrationDao";

export class IntegrationChannelService {
    constructor() {
        /**
         * FROM here: https://gist.github.com/servel333/21e1eedbd70db5a7cfff327526c72bc5
         */
        const reduceOp = function (args, reducer) {
            args = Array.from(args);
            args.pop(); // => options
            var first = args.shift();
            return args.reduce(reducer, first);
        };
        Handlebars.registerHelper({
            eq: function () {
                return reduceOp(arguments, (a, b) => a === b);
            },
            ne: function () {
                return reduceOp(arguments, (a, b) => a !== b);
            },
            lt: function () {
                return reduceOp(arguments, (a, b) => a < b);
            },
            gt: function () {
                return reduceOp(arguments, (a, b) => a > b);
            },
            lte: function () {
                return reduceOp(arguments, (a, b) => a <= b);
            },
            gte: function () {
                return reduceOp(arguments, (a, b) => a >= b);
            },
            and: function () {
                return reduceOp(arguments, (a, b) => a && b);
            },
            or: function () {
                return reduceOp(arguments, (a, b) => a || b);
            },
        });

        Handlebars.registerHelper("safe", function (inputData) {
            return new Handlebars.SafeString(inputData);
        });
        Handlebars.registerHelper("jsonStringSafe", function (inputData) {
            try {
                return new Handlebars.SafeString(JSON.stringify(inputData));
            } catch (ex) {
                console.error(ex);
            }
            return "";
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
        const integration = await this.dao.loadById(integrationId);
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

        const nodes = lodash.cloneDeep(channel.nodes);

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

        return `<routes xmlns=\"http://camel.apache.org/schema/spring\">${camelStr}</routes>`;
    }

    async deployChannel(integration, channelId) {
        const channel = await this.findIntegrationChannel(integration, channelId);

        let camelRoute = await this.convertChannelToCamel(channel);
        const response = await this.jumDao.deployRoute(channelId, camelRoute, channel.options || {});

        // console.log(response);

        return this.channelApplyStatus(channel, response);
    }

    async undeployChannel(integration, channelId) {
        const channel = await this.findIntegrationChannel(integration, channelId);

        try {
            await this.jumDao.undeployRoute(channelId);
        } catch (ex) {
            if (ex.response && ex.response.status == 404) {
                //Ignorar errores de canal no localizado ya que no aportan nada.
                //console.error(`Channel "${channel.id}" does not exist in JUM.`);
            } else {
                console.error(ex);
            }
        }

        return this.channelObjStatus(channel);
    }

    async channelStats(integration, channelId) {
        const channel = await this.findIntegrationChannel(integration, channelId);
        let channStats;
        try {
            channStats = await this.jumDao.getRouteStats(channel.id);
        } catch (ex) {
            if (ex.response && ex.response.status == 404) {
                //Ignorar errores de canal no localizado ya que no aportan nada.
                //console.error(`Channel "${channel.id}" does not exist in JUM.`);
            } else {
                console.error(ex);
            }
        }

        channel.stats = channStats; //TODO

        return channel;
    }

    async channelStatus(integration, channelId) {
        let channel = await this.findIntegrationChannel(integration, channelId);
        return channelObjStatus(channel);
    }

    async channelObjStatus(channel) {
        let remoteStatus;
        try {
            if (!remoteStatus) {
                //Si no se proporciona uno se realiza la llamada para obtenerlo.
                remoteStatus = await this.jumDao.getRouteStatus(channel.id);
            }
        } catch (ex) {
            if (ex.response && ex.response.status == 404) {
                //Ignorar errores de canal no localizado ya que no aportan nada.
                //console.error(`Channel "${channel.id}" does not exist in JUM.`);
            } else {
                console.error(ex);
            }
        }
        
        return this.channelApplyStatus(channel, remoteStatus);
    }

    async channelApplyStatus(channel, remoteChannel){
        channel.status = (remoteChannel && remoteChannel.status) || "UNDEPLOYED";
        channel.messages_total = (remoteChannel && remoteChannel.messages_total) || 0;
        channel.messages_error = (remoteChannel && remoteChannel.messages_error) || 0;
        channel.messages_sent = (remoteChannel && remoteChannel.messages_sent) || 0;
        return channel;
    }

    async channelLogs(integration, channel) {
        let channelLogs = "";
        try {
            channelLogs = await this.jumDao.getRouteLogs(channel);
        } catch (ex) {
            console.error(ex);
        }
        return channelLogs;
    }


    sendMessageToRoute(channel, endpoint, content){
        return this.jumDao.sendMessageToRoute(channel, endpoint, content)
    }
}
