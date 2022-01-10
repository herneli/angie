import { BaseService, App } from "lisco";
import moment from "moment";
import { JUMAgent, JUMAgentDao } from ".";
import { IntegrationChannelService } from "../integration_channel";

import ManualActions from "./ManualActions";

import lodash from "lodash";
import { JUMAgentSocketActions } from "./";

const status_pick_keys = ["status", "messages_sent", "messages_error", "messages_total", "uptime"];
export class JUMAgentService extends BaseService {
    constructor() {
        super(JUMAgentDao);
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
        return JUMAgentSocketActions.sendCommand(agent.last_socket_id, ...args);
    }

    /**
     * Método que desconecta a un agent en base al id.
     *
     * @param {*} id
     */
    async disconnectAgent(agentId) {
        if (!(await this.isRunning(agentId))) {
            console.log("already_disconnected");
            return;
        }
        const agent = await this.loadById(agentId);
        const socketId = agent.last_socket_id;

        await this.redistributeAgentChannels(agentId);

        agent.status = JUMAgent.STATUS_OFFLINE;
        agent.last_socket_id = "";
        agent.current_channels = { list: [] };

        //Actualizar con el estado del elemento
        await this.update(agentId, agent);

        await JUMAgentSocketActions.disconnectSocket(socketId);
    }

    /**
     * Envia un mensaje con los parametros pasados a todos los agentes conectados
     *
     * @returns
     */
    async sendToAll() {
        let args = [...arguments];
        return JUMAgentSocketActions.sendToAll(...args);
    }

    //Override
    async delete(id) {
        await this.disconnectAgent(id);
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
        let agent = await this.dao.loadById(id);
        if (!agent) {
            [agent] = await this.dao.save({
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
     * Metodo encargado de la lógica principal de conexión para los agentes
     */
    async listenForAgents(io) {
        //Resetear al inicio todos los agents marcándolos como offline
        await this.releaseAll();
        JUMAgentSocketActions.configureSocketEvents();

        //Middleware para trazar las incoming connections
        io.use((socket, next) => {
            let agentId = socket.handshake.query.id;

            console.log(`Received connection from ${agentId}@${socket.id}`);
            next();
        });
        //Middleware para la validación del token
        io.use((socket, next) => this.validateToken(socket, next));

        //Evento desencadenado en cada conexion de un nuevo agent
        io.on("connection", async (socket) => {
            let agentId = socket.handshake.query.id;
            try {
                let agent = await this.createAgentIfNotExists(agentId, socket);
                if (await this.isRunning(agent.id)) {
                    console.log("Already running");
                    socket.emit("messages", "Agent already online");
                    return socket.disconnect();
                }
                console.log("Agent connected: " + agent.id);
                //On disconnect
                socket.on("disconnect", async (reason) => {
                    console.log("Agent disconnected! -> " + agent.id);
                    console.log(reason);

                    await this.disconnectAgent(agent.id);
                });

                //Se pone como Online
                agent.status = JUMAgent.STATUS_ONLINE;
                agent.last_socket_id = socket.id;
                agent.last_online_date = moment().toISOString();
                agent.current_channels = { list: [] };

                //Actualizar con la nueva info.
                await this.dao.update(agent.id, agent);

                socket.emit("messages", "Connected!");
                //Configurar los elementos a escuchar.
                this.configureJUMEvents(socket);

                await this.loadAgentStatus(agent);
            } catch (ex) {
                console.error(ex);
                socket.emit("messages", "An error ocurred.");
                this.disconnectAgent(agentId);
            }
        });
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

        const newAgent = await this.dao.update(agent.id, agent);

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
     * Eventos desencadenados al realizar acciones sobre los canales.
     *
     * Este método solo puede ser desencadenado desde el nodo master en caso de esta en modo cluster.
     *
     * @param {*} agentId
     */
    configureJUMEvents(socket) {
        //TODO more events and implementations
        JUMAgentSocketActions.listenCommand(socket, "/master/ping", (agentId, channelId, callback) => {
            console.log("Received on server");
            return callback && callback("OK");
        });
        JUMAgentSocketActions.listenCommand(socket, "/channel/failure", (agentId, channelId, callback) => {
            console.log("Received on server");
            return callback && callback("OK");
        });
        JUMAgentSocketActions.listenCommand(socket, "/channel/started", async (agentId, channelId, callback) => {
            //Ignoramos aquellos desplegados de forma manual
            if (!(await ManualActions.isTrue("deploy", channelId))) {
                console.log(`Started ${channelId} on ${agentId} by itself.`);
                //TODO check if channel running in another?

                //Recargar los estados de ese agente para sincronia
                await this.loadAgentStatus(receivedFrom);
            } else {
                //Una vez desencadenado el evento de despliegue sobre ese canal se quita la marca de despliegue
                await ManualActions.resetAction("deploy", channelId);
            }

            return callback && callback("OK");
        });
        JUMAgentSocketActions.listenCommand(socket, "/channel/stopped", async (agentId, channelId, callback) => {
            if (!(await ManualActions.isTrue("undeploy", channelId))) {
                console.error(`Channel ${channelId} stopped unexpectedly.`);
                //Obtener el agent en el que se esperaba que estuviese desplegado
                const currentAgent = await this.getChannelCurrentAgent(channelId);

                //Desmarcarlo como "running" en el agente actual
                await this.removeChannelFromCurrentAgents(channelId);

                const channelService = new IntegrationChannelService();
                const channel = await channelService.getChannelById(channelId);
                //TODO check if channel may be redeployed
                console.log("Redeploying");
                //Obtener un candidato nuevo y desplegarlo en el
                const candidate = await this.getFreeAgent(channel, [currentAgent.id]);
                await this.deployChannel(channel, channel.last_deployed_route, candidate);
            } else {
                //Una vez desencadenado el evento de despliegue sobre ese canal se quita la marca de despliegue
                await ManualActions.resetAction("undeploy", channelId);
            }
            return callback && callback("OK");
        });
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

            await this.dao.update(agent.id, agent);
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

        await this.dao.update(agentId, agent);
    }

    /**
     * Obtiene un agente para la realización de un despliegue
     *
     * @param {*} channel
     * @returns
     */
    async getFreeAgent(channel, ignoredAgents, specificAgents) {
        let agents = await this.getRunningAgents();

        //Filtrar en base a los nodos asignados del canal
        if (channel.agent_assign_mode && channel.agent_assign_mode !== "auto") {
            agents = lodash.filter(agents, (elm) => {
                if (Array.isArray(channel.agent_assign_mode)) {
                    return channel.agent_assign_mode.indexOf(elm.id) !== -1;
                }
                return elm.id === channel.agent_assign_mode;
            });
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
        throw new Error("Agent not found!");
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

        await this.dao.update(currentAgent.id, currentAgent);

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
        await ManualActions.setAction("deploy", channel.id);
        const response = await this.sendCommand(candidate, "/channel/deploy", {
            id: channel.id,
            name: channel.name,
            xmlContent: route,
            options: channel.options || {},
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
            await this.dao.update(candidate, agent);
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

        await ManualActions.setAction("undeploy", channel.id);
        const response = await this.sendCommand(currentAgent.id, "/channel/undeploy", channel.id);

        if (response.success) {
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
     * Redistribuye los canales del agente a otros agentes
     *
     * @param {*} agentId
     */
    async redistributeAgentChannels(agentId) {
        const agent = await this.loadById(agentId);

        const channelService = new IntegrationChannelService();

        for (const deplChann of agent.current_channels.list) {
            const channel = await channelService.getChannelById(deplChann.id);
            //TODO check channel deployment config

            await this.undeployChannel(channel);

            const candidate = await this.getFreeAgent(channel, [agent.id]);
            await this.deployChannel(channel, channel.last_deployed_route, candidate);
        }
    }

    /**
     * Redespliega un canal en un agente diferente al actual
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
     * Utiliza la propiedad agent_assign_mode para especificar el agente en el que desplegar el canal.
     *
     * @param {*} channel
     * @param {*} agentId
     */
    async assignChannelToSpecificAgent(channel, agentId) {
        const candidate = await this.getFreeAgent(channel, null, [agentId]);

        await this.undeployChannel(channel);
        return this.deployChannel(channel, channel.last_deployed_route, candidate);
    }
}
