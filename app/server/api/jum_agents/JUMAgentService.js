import { BaseService } from "lisco";
import moment from "moment";
import { JUMAgent, JUMAgentDao } from ".";
import { IntegrationChannelService } from "../integration_channel";

import AgentActionsCache from "./AgentActionsCache";

import lodash from "lodash";
import { AgentSocketManager } from "./";
import { LibraryService } from "../library/LibraryService";

const status_pick_keys = ["status", "messages_sent", "messages_error", "messages_total", "uptime"];
export class JUMAgentService extends BaseService {
    constructor() {
        super(JUMAgentDao);
    }

    async listToScrap() {
        let targets = [];

        let { data, total } = await super.list({}, null, null);

        for (const agent of data) {
            targets.push({
                targets: [
                    (agent.meta.ip === "localhost" || agent.meta.ip === "::1" || agent.meta.ip === "127.0.0.1"
                        ? "host.docker.internal"
                        : agent.meta.ip) +
                        ":" +
                        agent.meta.rest_api_port,
                ],
                labels: {
                    __metrics_path__: "/actuator/prometheus",
                    jum_id: agent.id,
                    jum_name: agent.name,
                    status: agent.status,
                },
            });
        }
        return targets;
    }

    //Overwrite
    async list(filters, start, limit) {
        if (!filters) {
            filters = {};
        }
        if (!filters.sort) {
            filters.sort = { field: "name", direction: "ascend" };
        }

        const channelService = new IntegrationChannelService();

        let { data, total } = await super.list(filters, start, limit);

        for (const agent of data) {
            agent.channels = agent.current_channels ? agent.current_channels.list : [];
            for (const channel of agent.channels) {
                channel.integration = await channelService.getIntegrationByChannel(channel.id);
            }
        }

        return { data, total };
    }

    /**
     * Envía un comando a un agente con los parametros pasados
     *
     * @param {*} agentId
     * @param {*} [...] any
     * @returns
     */
    async sendCommand(agentId) {
        let args = lodash.drop(arguments, 1);
        if (!(await this.isRunning(agentId))) {
            throw new Error("agent_not_connected");
        }
        const agent = await this.loadById(agentId);

        if (!agent.approved) {
            throw new Error("agent_not_approved");
        }
        return AgentSocketManager.sendCommand(agent.last_socket_id, ...args);
    }

    /**
     * Método que desconecta a un agent en base al id.
     *
     * @param {*} agentId
     * @param {*} stop - Decide si parar todos sus canales o no
     * @returns Devuelve el agente antes de ser desconectado (con su lista de canales desplegados)
     */
    async disconnectAgent(agentId, stop) {
        if (!(await this.isRunning(agentId))) {
            console.log("already_disconnected");
            return;
        }
        const agent = await this.loadById(agentId);

        //Se clona el agente para evitar referencias modificadas
        const prevAgent = lodash.cloneDeep(agent);
        const socketId = agent.last_socket_id;

        if (stop) {
            await this.stopAllAgentChannels(agent);
        }

        agent.status = JUMAgent.STATUS_OFFLINE;
        agent.last_socket_id = "";
        agent.current_channels = { list: [] };

        //Actualizar con el estado del elemento
        await this.update(agentId, agent);

        await AgentSocketManager.disconnectSocket(socketId);

        return prevAgent;
    }

    /**
     * Envia un mensaje con los parametros pasados a todos los agentes conectados
     *
     * @returns
     */
    async sendToAll() {
        let args = [...arguments];
        return AgentSocketManager.sendToAll(...args);
    }

    //Override
    async delete(id) {
        const agent = await this.disconnectAgent(id, true);
        await this.redistributeAgentChannels(agent);
        return super.delete(id);
    }

    /**
     * Obtiene una lista con todos los agentes actualmente en ejecución
     *
     * @returns
     */
    getRunningAgents() {
        return this.dao.getRunningAgents();
    }

    /**
     * Comprueba si un agente esta en ejecución actualmente
     *
     * @param {*} id
     * @returns boolean
     */
    isRunning(id) {
        return this.dao.isRunning(id);
    }

    /**
     * Marca todos los agent como offline. Utilizado al arrancar el sistema
     * @returns
     */
    releaseAll() {
        return this.dao.releaseAll();
    }

    /**
     * Obtiene los metadatos de un agente
     * @param {*} socket
     * @returns
     */
    getSocketMetadata(socket) {
        if (!socket) return {};

        //TODO improve ip extraction
        const ip =
            socket.conn.transport.socket && socket.conn.transport.socket._socket.remoteAddress.replace("::ffff:", "");
        return {
            ip: ip, //socket.conn.remoteAddress,
            platform: socket.handshake.query.platform,
            rest_api_port: socket.handshake.query.rest_api_port,
        };
    }

    /**
     * Crea un nuevo agente si este no existe.
     *
     * @param {*} id
     * @param {*} socket
     * @returns
     */
    async createAgentIfNotExists(id, socket) {
        let agent = await this.loadById(id);
        if (!agent) {
            [agent] = await this.save({
                id: id,
                approved: false,
                joined_date: moment().toISOString(),
                name: (socket && socket.handshake.query.name) || id,
                status: JUMAgent.STATUS_OFFLINE,
            });

            if (socket) socket.emit("messages", "New Agent: " + id + " || Pending approval");
        }
        //Actualiza los metadatos en base al socket.
        agent.meta = this.getSocketMetadata(socket);
        return agent;
    }

    /**
     * Valida el token proporcionado contra el existente en la app.
     *
     * @param {*} socket
     * @param {*} next
     * @returns
     */
    async validateToken(socket, next) {
        let secret = socket.handshake.auth.token;

        if (secret !== process.env.JUM_AGENTS_SECRET) {
            const err = new Error("not_authorized");
            err.data = { content: "Invalid token." }; // additional details
            return next(err);
        }

        return next();
    }

    /**
     * Método que marca un agent como approved y solicita su estado
     *
     * @param {*} id
     * @returns
     */
    async approveAgent(agentId) {
        const agent = await this.loadById(agentId);
        if (!agent.approved) {
            agent.approved = true;
            agent.approved_date = moment().toISOString();
        }

        const newAgent = await this.update(agent.id, agent);

        await this.loadAgentStatus(agent);

        return newAgent;
    }

    /**
     *
     * @param {*} agentId
     * @param {*} callback
     * @returns
     */
    async validateCommandFromAgent(agentId, callback) {
        const agent = await self.service.loadById(agentId);
        if (!agent) {
            if (calback) return callback("agent_not_connected");
        }
        if (!agent.approved) {
            if (calback) return callback("agent_not_approved");
        }
        return true;
    }

    /**
     * Carga el estado de un agente incluyendo todos sus canales
     *
     * @param {*} agent
     * @returns
     */
    async loadAgentStatus(agent) {
        if (!agent.approved) {
            return false;
        }
        const response = await this.sendCommand(agent.id, "/agent/status");

        if (!response.success) {
            throw new Error(response.data);
        }
        if (response.data && !lodash.isEmpty(response.data)) {
            const ids = lodash.map(response.data, (ch) => ({
                id: ch.id,
                name: ch.name,
                status: lodash.pick(lodash.find(response.data, { id: ch.id }), status_pick_keys),
            }));

            agent.current_channels = { list: ids };

            await this.update(agent.id, agent);
        }
    }

    /**
     * Establece el estado de un canal en un running agent
     * @param {*} agentId
     * @param {*} channelId
     */
    async setAgentChannelStatus(agentId, channelId, status) {
        const agent = await this.loadById(agentId);
        const channel = lodash.find(agent.current_channels.list, { id: channelId });
        channel.status = lodash.pick(status, status_pick_keys);

        await this.update(agentId, agent);
    }

    /**
     * Obtiene un agente para la realización de un despliegue. Solo se evaluan los agentes ONLINE!
     *
     * @param {*} channel
     * @returns
     */
    async getFreeAgent(channel, ignoredAgents, specificAgents) {
        let agents = await this.getRunningAgents();

        //Filtrar en base a los nodos asignados del canal
        if (channel.deployment_options && channel.deployment_options.agent_assign_mode !== "auto") {
            agents = lodash.filter(agents, (elm) => {
                if (Array.isArray(channel.deployment_options.assigned_agent)) {
                    return channel.deployment_options.assigned_agent.indexOf(elm.id) !== -1;
                }
                return elm.id === channel.deployment_options.assigned_agent;
            });
            //Errores específicos
            if (agents.length === 0 && specificAgents !== null) {
                throw new Error("specified_agent_not_selectable");
            }
            if (agents.length === 0) {
                throw new Error("fixed_agents_unavailable");
            }
        }

        //Poder ignorar determinados agentes, util para redistribuir excluyendo ciertos elementos.
        if (ignoredAgents) {
            agents = lodash.filter(agents, (elm) => {
                return ignoredAgents.indexOf(elm.id) === -1;
            });
        }
        //Poder especificar determinados agentes, util para redistribuir incluyendo solo ciertos elementos.
        if (specificAgents) {
            agents = lodash.filter(agents, (elm) => {
                return specificAgents.indexOf(elm.id) !== -1;
            });
        }

        //Solo agentes aprobados y online
        agents = lodash.filter(agents, (elm) => elm.approved === true && elm.status === JUMAgent.STATUS_ONLINE);

        //Obtener el candidato mas viable dentro de la lista de nodos
        let candidate = lodash.reduce(
            agents,
            (result, value) => {
                const channelsLength =
                    value.current_channels && value.current_channels.list ? value.current_channels.list.length : 0;
                if (result.id === null || result.count > channelsLength) {
                    result.count = channelsLength;
                    result.id = value.id;
                }
                return result;
            },
            { id: null, count: 0 }
        );

        if (!candidate.id) {
            throw new Error("no_agent_available");
        }

        return candidate.id;
    }

    /**
     * Obtiene el agente que tiene desplegado a un canal concreto
     *
     * @param {*} channelId
     * @returns
     */
    async getChannelCurrentAgent(channelId) {
        const agents = await this.getRunningAgents();

        for (const idx in agents) {
            const elm = agents[idx];
            if (!elm.current_channels || !elm.current_channels.list) {
                elm.current_channels = { list: [] };
            }
            const chann = lodash.find(elm.current_channels.list, { id: channelId });

            if (chann) {
                return elm;
            }
        }
        //Si no existe ninguno... error
        throw new Error("channel_not_running");
    }

    /**
     * Obtiene el estado de un canal concreto
     *
     * @param {*} channelId
     * @returns
     */
    async getChannelCurrentState(channelId) {
        try {
            const currentAgent = await this.getChannelCurrentAgent(channelId);

            const response = await this.sendCommand(currentAgent.id, "/channel/status", channelId);
            if (response.success) {
                await this.setAgentChannelStatus(currentAgent.id, channelId, response.data);
                const agent = await this.loadById(currentAgent.id);
                return { channelState: response.data, currentAgent: agent };
            }
        } catch (ex) {
            return { channelState: null, currentAgent: null };
        }

        return { channelState: null, currentAgent: null };
    }

    /**
     *  Elimina un canal de la lista de canales del agente que lo esta ejecutando.
     *
     * @param {*} channelId
     * @returns
     */
    async removeChannelFromCurrentAgents(channelId) {
        const currentAgent = await this.getChannelCurrentAgent(channelId);

        currentAgent.current_channels = {
            list: lodash.filter(currentAgent.current_channels.list, (el) => el.id !== channelId),
        };

        await this.update(currentAgent.id, currentAgent);

        return currentAgent;
    }

    /**
     * Despliega una ruta
     *
     * @param {*} channel
     * @param {*} route
     * @param {*} ignoredAgents
     * @returns
     */
    async deployChannel(channel, route, candidate) {
        await AgentActionsCache.setAction("deploy", channel.id);
        const response = await this.sendCommand(candidate, "/channel/deploy", {
            id: channel.id,
            name: channel.name,
            xmlContent: route,
            options: channel.deployment_options || {},
        });

        if (response.success) {
            let agent = await this.loadById(candidate);
            if (!agent.current_channels || !agent.current_channels.list) {
                agent.current_channels = { list: [] };
            }
            agent.current_channels.list.push({
                id: channel.id,
                name: channel.name,
                status: lodash.pick(response.data, status_pick_keys),
            });
            await this.update(candidate, agent);
            return response.data;
        }
        throw new Error(response.data);
    }

    /**
     * Repliega una ruta
     *
     * @param {*} channel
     * @returns
     */
    async undeployChannel(channel) {
        const currentAgent = await this.getChannelCurrentAgent(channel.id);

        await AgentActionsCache.setAction("undeploy", channel.id);
        const response = await this.sendCommand(currentAgent.id, "/channel/undeploy", channel.id);

        //Si se ha detenido o el socket ya no se encuentra disponible, se elimina del agente.
        if (response.success || response.data === "socket_not_connected") {
            await this.removeChannelFromCurrentAgents(channel.id);
            return response.data;
        }
        throw new Error(response.data);
    }

    /**
     * Obtiene los logs de un canal
     *
     * @param {*} channel
     * @returns
     */
    async channelLogs(channel) {
        const response = await this.sendToAll("/channel/log", channel.id);
        if (Array.isArray(response) && response.length !== 0) {
            return response;
        }
        if (response.success) {
            return response.data;
        }
        throw new Error(response.data);
    }

    /**
     * Envia un mensaje a un canal
     *
     * @param {*} channel
     * @param {*} endpoint
     * @param {*} content
     * @returns
     */
    async sendMessageToRoute(channel, endpoint, content) {
        const currentAgent = await this.getChannelCurrentAgent(channel.id);

        const response = await this.sendCommand(currentAgent.id, "/channel/sendMessageToRoute", channel.id, {
            endpoint: endpoint,
            content: content,
        });

        if (response.success) {
            return response.data;
        }
        throw new Error(response.data);
    }

    /**
     * Metodo que detiene todos los canales desplegados en un agente
     *
     * @param {*} agent
     */
    async stopAllAgentChannels(agent) {
        for (const channel of agent.current_channels.list) {
            await this.undeployChannel(channel);
        }
    }

    /**
     * Redistribuye los canales del agente a otros agentes (Tiene en cuenta la configuracion de deployment y de restart)
     *
     * @param {*} agentId
     */
    async redistributeAgentChannels(agent) {
        const channelService = new IntegrationChannelService();

        for (const deplChann of agent.current_channels.list) {
            const channel = await channelService.getChannelById(deplChann.id);

            try {
                await this.undeployChannel(channel);
            } catch (ex) {
                if (ex.message && ex.message != "channel_not_running") {
                    console.error(ex);
                }
            }

            try {
                await this.redeployChannel(channel, [agent.id]);
            } catch (ex) {
                console.log(ex);
            }
        }
    }

    /**
     * Redespliega un canal en un agente diferente al actual (Tiene en cuenta la configuracion de deployment)
     *
     * @param {*} channelId
     */
    async assignChannelToAnotherAgent(channel) {
        const currentAgent = await this.getChannelCurrentAgent(channel.id);

        const candidate = await this.getFreeAgent(channel, [currentAgent.id]);

        await this.undeployChannel(channel);
        return this.deployChannel(channel, channel.last_deployed_route, candidate);
    }

    /**
     * Despliega el canal en un agente concreto (Tiene en cuenta la configuracion de deployment)
     *
     * @param {*} channel
     * @param {*} agentId
     */
    async assignChannelToSpecificAgent(channel, agentId) {
        const candidate = await this.getFreeAgent(channel, null, [agentId]);

        await this.undeployChannel(channel);
        return this.deployChannel(channel, channel.last_deployed_route, candidate);
    }

    /**
     * Evalua todos los canales para ver cuales han de ser redesplegados en base a su configuración.
     *
     * @param {*} agent
     */
    async redeployNotRunningChannels() {
        const { data: onlineAgents } = await super.list({ status: "online" }, null, null);

        const channelService = new IntegrationChannelService();
        const channels = await channelService.listAllChannels();

        for (const channel of channels) {
            try {
                if (channel.status !== "Started") {
                    for (const agent of onlineAgents) {
                        //Obtener de nuevo el estado para asegurarse (Evitar redesplegarlo si otro agente se ha adelantado)
                        const updatedChannel = await channelService.channelObjStatus(channel);
                        if (updatedChannel.status !== "Started") {
                            //Obtener un candidato nuevo y desplegarlo en el
                            await this.redeployChannel(channel, null, [agent.id]);
                        }
                    }
                }
            } catch (ex) {
                console.error(ex);
            }
        }
    }

    /**
     * Redespliega un canal basandose en su configuración de reinicios
     */
    async redeployChannel(channel, ignoreAgents, specificAgents) {
        const policy = channel.deployment_options && channel.deployment_options.restart_policy;

        if (policy === "unless_stopped" && channel.last_deployed_route) {
            console.debug(`Trying to auto deploy: ${channel.name}`);
            const candidate = await this.getFreeAgent(channel, ignoreAgents, specificAgents);
            return await this.deployChannel(channel, channel.last_deployed_route, candidate);
        }

        if (policy === "allways") {
            console.debug(`Trying to auto deploy: ${channel.name}`);
            let route = channel.last_deployed_route;
            if (!route) {
                //rebuild route
                const channelService = new IntegrationChannelService();
                route = await channelService.convertChannelToCamel(channel);
            }

            const candidate = await this.getFreeAgent(channel, ignoreAgents, specificAgents);
            return await this.deployChannel(channel, route, candidate);
        }
    }

    /**
     *
     *
     * @param {*}
     * @returns
     */
    async getAgentDependencies(agent) {
        const service = new JUMAgentService();
        const response = await this.sendCommand(agent.id, "/agent/get_dependencies");

        await service.update(agent.id, agent);

        if (response.data == null) {
            return [];
        }
        if (response.data) {
            return response.data;
        }

        if (!response.success) {
            throw new Error(response.data);
        }
    }
    /**
     *
     *
     * @param {*}
     * @returns
     */
    async reloadDependencies(agent) {
        const libraries = await new LibraryService().list();
        let response;
        let prev_dependencies = await this.getAgentDependencies(agent);
        let addedDependencies = [];

        if (prev_dependencies && prev_dependencies.length > 0) {
            let libraries_to_add = lodash.differenceWith(libraries.data, prev_dependencies, lodash.isEqual);
            if (libraries_to_add.length > 0) {
                response = await this.sendCommand(agent.id, "/agent/load_dependencies", libraries_to_add);
                addedDependencies = [...addedDependencies, ...libraries.data];
            } else {
                response = {};
                return (response.data = prev_dependencies);
            }
        } else {
            response = await this.sendCommand(agent.id, "/agent/load_dependencies", libraries.data);
        }

        if (response && response.data) {
            return response.data;
        }

        if (!response) {
            throw new Error("No response from the Reload of dependencies");
        }

        if (!response.success) {
            throw new Error(response.data);
        }
    }

    /**
     * Devuelve un array con los id de los certificados asignados al agent con id pasado como parámetro.
     *
     * @param {*} id
     * @returns array
     */
    getCertificates(id) {
        return this.dao.getCertificates(id);
    }

    /**
     * Actualiza los certificados asignados a un agent.
     * 
     * @param {*} id 
     * @param {*} certificate_ids 
     */
    async updateCertificates(id, certificate_ids) {
        await this.dao.updateCertificates(id, certificate_ids);
    }

    async reloadCertificates(agent_id) {
        let certificates = await this.getCertificates(agent_id);

        const response = await this.sendCommand(agent_id, "/agent/load_certificates", certificates);

        if (response && response.data) {
            return response.data;
        }

        if (!response) {
            throw new Error("No response from the Reload of certificates");
        }

        if (!response.success) {
            throw new Error(response.data);
        }
    }

}
