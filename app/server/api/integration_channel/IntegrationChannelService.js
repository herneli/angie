import { Utils, BaseService } from "lisco";

import lodash from "lodash";
import { ConfigurationService } from "../configuration/ConfigurationService";
import { IntegrationDao } from "../integration/IntegrationDao";
import { JUMAgentService } from "../jum_agents";
import { IntegrationService } from "../integration";
import { MessageService } from "../messages";
import { ChannelHandlebarsHelpers } from "./";

let Handlebars;

export class IntegrationChannelService {
    constructor() {
        Handlebars = ChannelHandlebarsHelpers.configure();

        this.dao = new IntegrationDao();
        this.messageService = new MessageService();
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
        const integrationService = new IntegrationService();
        const integration = await integrationService.loadById(integrationId);
        return lodash.find(integration.data.channels, { id: channelId });
    }

    /**
     * Busca un canal en todas las integraciones
     *
     * @param {*} channelId
     * @returns
     */
    async findChannel(channelId) {
        const integrationService = new IntegrationService();
        const { data: integrations } = await integrationService.list();

        for (const integration of integrations) {
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
        const integrationService = new IntegrationService();
        const { data: integrations } = await integrationService.list();

        for (const integration of integrations) {
            const found = lodash.find(integration.data.channels, { id: channelId });
            if (found) {
                return integration;
            }
        }
        return null;
    }

    /**
     * Obtiene una lista con todos los canales de la aplicación
     *
     * @returns
     */
    async listAllChannels() {
        const integrationService = new IntegrationService();
        const { data: integrations } = await integrationService.list();

        let channels = [];
        for (const integration of integrations) {
            channels = [...channels, ...integration.data.channels];
        }

        return channels;
    }

    /**
     * Busca un canal mediante su identificador
     *
     * @param {*} channelId
     * @returns
     */
    async getChannelById(channelId) {
        const integrationService = new IntegrationService();
        const { data: integrations } = await integrationService.list();

        for (const integration of integrations) {
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

        const { data: node_types } = await configService.list("node_type");
        const integration = await this.getIntegrationByChannel(channel.id);

        const nodes = lodash.cloneDeep(channel.nodes);

        let camelStr = "";
        for (const idx in nodes) {
            const element = nodes[idx];

            let type = lodash.find(node_types, (el) => {
                //return el.id === element.type_id || el.code === element.type_id; //Retrocompatibilidad, se empezara a usar solo code
                let result = el.id === element.type_id || el.code === element.type_id;
                if (!result && el.data.alt_codes) {
                    const splitted = el.data.alt_codes.split(",");
                    result = splitted.indexOf(element.type_id) !== -1;
                }
                return result;
            });
            if (!type) continue;
            if (type.data.handles === "none") continue;

            camelStr += await this.convertNodeTypeToCamel(type, element, integration);
        }

        return `<routes xmlns=\"http://camel.apache.org/schema/spring\">${camelStr}</routes>`;
    }

    /**
     * Convierte un tipo de nodo en camel xml usando data
     *
     * @param {*} node
     * @param {*} data
     * @returns
     */
    async convertNodeTypeToCamel(node, data, integration) {
        if (node.data.xml_template) {
            //Add TagHeader
            let procTemplate = node.data.xml_template.replace(
                /<route\s+id\b[^>]*>/gm,
                '<route id="{{source}}" group="{{getTags tags}}"><description>{{label}}</description>'
            );

            const template = await Handlebars.compile(procTemplate);

            if (data.data.handles) {
                //Calcular los links de los diferentes handles para la conversion
                data.data.handles = this.linkHandles(data.data.handles, data.links);
            }
            return await template({
                source: data.id,
                target: data.links && data.links.length !== 0 ? lodash.map(data.links, "node_id") : ["empty"],
                organization: integration && integration.deployment_config && integration.deployment_config.organization_id,
                ...data.data,
            });
        }
        return "";
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
        let messages;
        try {
            // messages = await this.messageService.getChannelMessageCount(channel.id);
        } catch (ex) {
            console.error(ex);
        }
        channel.status = (remoteChannel && remoteChannel.status) || "UNDEPLOYED";
        channel.messages_total = messages ? messages.total : (remoteChannel && remoteChannel.messages_total) || 0;
        channel.messages_error = messages ? messages.error : (remoteChannel && remoteChannel.messages_error) || 0;
        channel.messages_sent = messages ? messages.sent : (remoteChannel && remoteChannel.messages_sent) || 0;

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
