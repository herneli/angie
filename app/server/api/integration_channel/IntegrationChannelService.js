import { Utils, BaseService } from "lisco";

import Handlebars from "handlebars";
import lodash from "lodash";
import * as queryString from "query-string";
import { ConfigurationService } from "../configuration/ConfigurationService";
import { IntegrationDao } from "../integration/IntegrationDao";
import { JUMAgentService } from "../jum_agents";

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
            return new Handlebars.SafeString(
                !lodash.isEmpty(inputData) ? "?" + encodeURIComponent(queryString.stringify(data)) : ""
            );
        });

        this.dao = new IntegrationDao();
        this.agentService = new JUMAgentService();
    }

    /**
     * Busca un canal en una integracion
     *
     * @param {*} integrationId
     * @param {*} channelId
     * @returns
     */
    async findIntegrationChannel(integrationId, channelId) {
        const integration = await this.dao.loadById(integrationId);
        return lodash.find(integration.data.channels, { id: channelId });
    }

    /**
     * Busca un canal en todas las integraciones
     *
     * @param {*} channelId
     * @returns
     */
    async findChannel(channelId) {
        const integrations = await this.dao.loadAllData();

        for (const integration of integrations) {
            integration.data.deployment_config = integration.deployment_config;

            const found = lodash.find(integration.data.channels, { id: channelId });
            if (found) {
                return found;
            }
        }
        return null;
    }

    /**
     * Obtiene la integración a la que pertenece un canal concreto.
     *
     * @param {*} channelId
     * @returns
     */
    async getIntegrationByChannel(channelId) {
        const integrations = await this.dao.loadAllData();

        for (const integration of integrations) {
            integration.data.deployment_config = integration.deployment_config;

            const found = lodash.find(integration.data.channels, { id: channelId });
            if (found) {
                return integration;
            }
        }
        return null;
    }

    /**
     * Busca un canal mediante su identificador
     * 
     * @param {*} channelId
     * @returns
     */
    async getChannelById(channelId) {
        const integrations = await this.dao.loadAllData();

        for (const integration of integrations) {
            integration.data.deployment_config = integration.deployment_config;

            const found = lodash.find(integration.data.channels, { id: channelId });
            if (found) {
                return found;
            }
        }
        return null;
    }

    /**
     * Convierte un canal de una integración (en base a sus identificadores) en una ruta camel
     *
     * @param {*} integration
     * @param {*} channel
     * @returns
     */
    async convertToCamelId(integrationId, channelId) {
        const channel = await this.findIntegrationChannel(integrationId, channelId);

        return this.convertChannelToCamel(channel);
    }

    /**
     * Convierte un canal en una ruta camel
     *
     * @param {*} channel
     * @returns
     */
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

            let type = lodash.find(node_types, (el) => {
                return el.id === element.type_id || el.code === element.type_id; //Retrocompatibilidad, se empezara a usar solo code
            });
            if (type.data.handles === "none") continue;
            if (!type) continue;
            let camelComponent = lodash.find(camel_components, {
                code: type.data.camel_component_id,
            });

            if (camelComponent.data.xml_template) {
                const template = Handlebars.compile(camelComponent.data.xml_template);

                if (element.data.handles) {
                    //Calcular los links de los diferentes handles para la conversion
                    element.data.handles = this.linkHandles(element.data.handles, element.links);
                }
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

    /**
     * Metodo para unificar los handles de los nodos de un canal con los links existentes.
     *
     * El objetivo identificar a que handle (to) pertenece cada Link realizado.
     *
     * @param {*} handles
     * @param {*} links
     * @returns
     */
    linkHandles = (handles, links) => {
        for (const handle of handles) {
            const link = lodash.filter(links, { handle: handle.id });
            handle.to = lodash.map(link, "node_id") || "empty";
        }
        return handles;
    };

    /**
     *
     * @param {*} integrationId
     * @param {*} channelId
     * @param {*} toAgentId
     * @returns
     */
    async moveChannel(integrationId, channelId, toAgentId) {
        const channel = await this.findIntegrationChannel(integrationId, channelId);

        if (!toAgentId) {
            const response = await this.agentService.assignChannelToAnotherAgent(channel);
            return this.channelApplyStatus(channel, response);
        }

        const response = await this.agentService.assignChannelToSpecificAgent(channel, toAgentId);
        return this.channelApplyStatus(channel, response);
    }

    /**
     * Despliega un canal en base a los identificadores de integración y canal.
     *
     * @param {*} integrationId
     * @param {*} channelId
     * @returns
     */
    async deployChannel(integrationId, channelId) {
        const channel = await this.findIntegrationChannel(integrationId, channelId);

        return this.performDeploy(channel);
    }

    /**
     * Almacena la última ruta desplegada para un canal de forma que pueda ser reutilizada en operaciones automáticas (redespliegues, etc)
     * sin necesidad de recalcularla.
     *
     * @param {*} channelId
     */
    async saveChannelDeployedRoute(channelId, camelRoute) {
        const integration = await this.getIntegrationByChannel(channelId);

        for (let bdChann of integration.data.channels) {
            if (bdChann.id === channelId) {
                bdChann.last_deployed_route = camelRoute;
            }
        }
        await this.dao.update(integration.id, integration);
    }

    /**
     * Realiza el despliegue de un canal
     *
     * @param {*} channel
     * @returns
     */
    async performDeploy(channel) {
        let camelRoute = await this.convertChannelToCamel(channel);

        //Save deployed route (snapshot)
        await this.saveChannelDeployedRoute(channel.id, camelRoute);

        const candidate = await this.agentService.getFreeAgent(channel);
        const response = await this.agentService.deployChannel(channel, camelRoute, candidate);

        return this.channelApplyStatus(channel, response);
    }

    /**
     * Vacía la última versión del canal desplegado.
     *
     * @param {*} channelId
     * @param {*} camelRoute
     */
    async removeChannelDeployedRoute(channelId) {
        const integration = await this.getIntegrationByChannel(channelId);

        for (let bdChann of integration.data.channels) {
            if (bdChann.id === channelId) {
                bdChann.last_deployed_route = null;
            }
        }
        await this.dao.update(integration.id, integration);
    }

    /**
     * Repliega un canal en base a los identificadores de integración y canal
     *
     * @param {*} integrationId
     * @param {*} channelId
     * @returns
     */
    async undeployChannel(integrationId, channelId) {
        const channel = await this.findIntegrationChannel(integrationId, channelId);

        return this.performUndeploy(channel);
    }

    /**
     * Realiza el repliegue de un canal
     *
     * @param {*} channel
     * @returns
     */
    async performUndeploy(channel) {
        try {
            //Eliminamos el xml desplegado con anterioridad para evitar comportamientos no deseados.
            await this.removeChannelDeployedRoute(channel.id);

            await this.agentService.undeployChannel(channel);
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

    /**
     * Obtiene el estado de un canal en base a los identificadores de integración y canal
     *
     * @param {*} integrationId
     * @param {*} channelId
     * @returns
     */
    async channelStatus(integrationId, channelId) {
        let channel = await this.findIntegrationChannel(integrationId, channelId);
        return this.channelObjStatus(channel);
    }

    /**
     * Obtiene el estado de un canal
     *
     * @param {*} channel
     * @returns
     */
    async channelObjStatus(channel) {
        let channelState;
        try {
            if (!channelState) {
                //Si no se proporciona uno se realiza la llamada para obtenerlo.
                ({ channelState } = await this.agentService.getChannelCurrentState(channel.id));
            }
        } catch (ex) {
            if (ex.response && ex.response.status == 404) {
                //Ignorar errores de canal no localizado ya que no aportan nada.
                //console.error(`Channel "${channel.id}" does not exist in JUM.`);
            } else {
                console.error(ex);
            }
        }

        return this.channelApplyStatus(channel, channelState);
    }

    /**
     *  Aplica el estado sobre un objeto canal
     *
     * @param {*} channel
     * @param {*} remoteChannel
     * @returns
     */
    async channelApplyStatus(channel, remoteChannel) {
        channel.status = (remoteChannel && remoteChannel.status) || "UNDEPLOYED";
        channel.messages_total = (remoteChannel && remoteChannel.messages_total) || 0;
        channel.messages_error = (remoteChannel && remoteChannel.messages_error) || 0;
        channel.messages_sent = (remoteChannel && remoteChannel.messages_sent) || 0;
        return channel;
    }

    /**
     * Obtiene el estado de un canal en base a los identificadores de integración y canal
     *
     * @param {*} integrationId
     * @param {*} channelId
     * @returns
     */
    async channelLogs(integrationId, channelId) {
        const channel = await this.findIntegrationChannel(integrationId, channelId);

        let channelLogs = "";
        try {
            channelLogs = await this.agentService.channelLogs({ id: channel.id });
        } catch (ex) {
            console.error(ex);
        }
        return channelLogs;
    }

    /**
     * Envía un mensaje a un endpoint de un canal concreto
     *
     * @param {*} channelId
     * @param {*} endpoint
     * @param {*} content
     * @returns
     */
    async sendMessageToRoute(channelId, endpoint, content) {
        return await this.agentService.sendMessageToRoute({ id: channelId }, endpoint, content);
    }
}
