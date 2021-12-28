import { BaseService, App } from "lisco";
import moment from "moment";
import { JUMAgent, JUMAgentDao } from ".";
import { IntegrationChannelService } from "../integration_channel";

import lodash from "lodash";

export class JUMAgentService extends BaseService {
    constructor() {
        super(JUMAgentDao);

        App.agentsManuallyDeployed = {};
        App.agentsManuallyUndeployed = {};
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
            if (this.isAgentRunning(agent.id)) {
                const { channels } = this.getRunningAgent(agent.id);
                agent.channels = channels;
                for (const channel of agent.channels) {
                    channel.integration = await channelService.getIntegrationByChannel(channel.id);
                }
            }
        }

        return { data, total };
    }

    /**
     * Obtiene un agente del mapa memoria
     * @param {*} agentId
     * @returns
     */
    getRunningAgent(agentId) {
        return App.agents[agentId] || {};
    }

    /**
     * Comprueba si un agente esta en ejecucion
     * @param {*} agentId
     * @returns
     */
    isAgentRunning(agentId) {
        return App.agents[agentId] ? true : false;
    }

    /**
     *
     * @param {*} agentId
     * @param {*} data
     */
    addRunningAgent(agentId, data) {
        App.agents[agentId] = { ...data };
    }

    /**
     *
     * @param {*} agentId
     */
    removeRunningAgent(agentId) {
        delete App.agents[agentId];
    }

    //Override
    async delete(id) {
        await this.disconnectAgent(id);
        return super.delete(id);
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

        return {
            ip: socket.conn.remoteAddress,
            platform: socket.handshake.query.platform,
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
    async listenForAgents() {
        App.agents = {};

        //Resetear al inicio todos los agents marcándolos como offline
        await this.releaseAll();

        //Middleware para trazar las incoming connections
        App.server.app.io.use((socket, next) => {
            let agentId = socket.handshake.query.id;

            console.log(`Received connection from ${agentId}@${socket.id}`);
            next();
        });
        //Middleware para la validación del token
        App.server.app.io.use((socket, next) => this.validateToken(socket, next));

        //Evento desencadenado en cada conexion de un nuevo agent
        App.server.app.io.on("connection", async (socket) => {
            try {
                //Obtener el secret del agente
                let agentId = socket.handshake.query.id;

                let agent = await this.createAgentIfNotExists(agentId, socket);
                if (this.isAgentRunning(agent.id)) {
                    socket.emit("messages", "Agent already online");
                    return socket.disconnect();
                }
                console.log("Agent connected: " + agent.id);

                //Se pone como Online
                agent.status = JUMAgent.STATUS_ONLINE;
                //Actualizar con la nueva info.
                await this.dao.update(agent.id, agent);

                //Register agent
                this.addRunningAgent(agent.id, {
                    socket: socket,
                    agent: agent,
                    channels: [],
                });

                socket.emit("messages", "Connected!");
                //Configurar los elementos a escuchar.
                this.configureJUMEvents(agent.id);

                this.loadAgentStatus(agent);

                socket.on("disconnect", async (reason) => {
                    console.log("Agent disconnected! -> " + agent.id);
                    console.log(reason);

                    this.disconnectAgent(agent.id);
                });
            } catch (ex) {
                console.error(ex);
                socket.emit("messages", "An error ocurred.");
                this.disconnectAgent(agent.id);
            }
        });
    }

    /**
     * Método que desconecta a un agent en base al id.
     *
     * @param {*} id
     */
    async disconnectAgent(id) {
        try {
            if (!this.isAgentRunning(id)) {
                throw new Error("Agent not connected");
            }
            const { agent, socket } = this.getRunningAgent(id);

            this.redistributeAgentChannels(id);

            //Force socket close
            if (socket && socket.disconnect) {
                socket.disconnect(true);
            }
            agent.status = JUMAgent.STATUS_OFFLINE;

            this.removeRunningAgent(agent.id);
            //Actualizar con el estado del elemento
            await this.dao.update(agent.id, agent);
        } catch (ex) {
            console.error(ex);
        }
    }

    /**
     * Método que marca un agent como approved o unapproved en base al estado actual
     * @param {*} id
     * @returns
     */
    async approveAgent(id) {
        let agent;
        if (this.isAgentRunning(id)) {
            agent = this.getRunningAgent(id).agent;
        } else {
            agent = this.loadById(id);
        }

        if (!agent.approved) {
            agent.approved = true;
            agent.approved_date = moment().toISOString();
        }

        const newAgent = await this.dao.update(agent.id, agent);
        this.loadAgentStatus(agent);
        return newAgent;
    }

    /**
     * Método que envía un comando a un agent
     *
     * @param {*} agentId
     * @param {*} commandName
     * @param {*} data
     * @returns
     */
    async sendCommand(agentId) {
        let args = lodash.drop(arguments, 1);

        if (!this.isAgentRunning(agentId)) {
            throw new Error("agent_not_connected");
        }
        const { agent, socket } = this.getRunningAgent(agentId);

        if (!agent.approved) {
            throw new Error("agent_not_approved");
        }

        return new Promise((resolve, reject) => {
            try {
                args.push((data) => {
                    if (data.error) {
                        return reject(data);
                    }
                    return resolve(data);
                });
                socket.emit(...args);
            } catch (ex) {
                reject(ex);
            }
        });
    }

    /**
     * Envia un comando a todos los agentes esperando su respuesta
     *
     * @returns
     */
    async sendToAll() {
        let args = [...arguments];

        let commands = [];
        for (const agentId in App.agents) {
            commands.push(this.sendCommand(agentId, ...args));
        }
        if (commands.length != 0) {
            return Promise.all(commands);
        }
        return { success: false, data: "no_channels_connected" };
    }

    /**
     * Método que envía un comando a todos los agents sin esperar la respuesta
     *
     * @param {*} agentId
     * @param {*} commandName
     * @param {*} data
     * @returns
     */
    async broadcastCommand() {
        let args = [...arguments];

        return new Promise((resolve, reject) => {
            try {
                args.push((data) => {
                    if (data.error) {
                        return reject(data);
                    }
                    return resolve(data);
                });
                App.server.app.io.emit(...args);
            } catch (ex) {
                reject(ex);
            }
        });
    }

    /**
     * Método que activa una escucha sobre un comando
     * @param {*} agentId
     * @param {*} commandName
     * @param {*} func
     */
    async listenCommand(agentId, commandName, func) {
        const { socket } = this.getRunningAgent(agentId);
        const self = this;

        try {
            socket.off(commandName);
        } catch (ex) {}

        socket.on(commandName, function () {
            let args = [...arguments];
            const callback = args[args.length - 1];

            const { agent } = self.getRunningAgent(agentId);
            if (!agent) {
                return callback("agent_not_connected");
            }
            if (!agent.approved) {
                return callback("agent_not_approved");
            }

            return func(...args);
        });
    }

    /**
     * Eventos desencadenados al realizar acciones sobre los canales
     *
     * @param {*} agentId
     */
    configureJUMEvents(agentId) {
        //TODO more events and implementations
        this.listenCommand(agentId, "/channel/failure", (data, callback) => {
            console.log("Received on server");
            return callback && callback("OK");
        });
        this.listenCommand(agentId, "/channel/started", (receivedFrom, channelId, callback) => {
            //Ignoramos aquellos desplegados de forma manual
            if (!App.agentsManuallyDeployed[channelId]) {
                console.log(`Started ${channelId} on ${receivedFrom} by itself.`);
                //Recargar los estados de ese agente para sincronia
                this.loadAgentStatus(receivedFrom);
            } else {
                //Una vez desencadenado el evento de despliegue sobre ese canal se quita la marca de despliegue
                delete App.agentsManuallyDeployed[channelId];
            }

            return callback && callback("OK");
        });
        this.listenCommand(agentId, "/channel/stopped", async (channelId, callback) => {
            if (!App.agentsManuallyUndeployed[channelId]) {
                console.error(`Channel ${channelId} stopped unexpectedly.`);

                await this.assignChannelToAnotherAgent(channelId);
                await this.removeChannelFromCurrentAgents(channelId);
            } else {
                //Una vez desencadenado el evento de despliegue sobre ese canal se quita la marca de despliegue
                delete App.agentsManuallyUndeployed[channelId];
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

        if (response.data && !lodash.isEmpty(response.data)) {
            const ids = lodash.map(response.data, (ch) => ({
                id: ch.id,
                name: ch.name,
                agentId: agent.id,
                status: lodash.find(response.data, { id: ch.id }),
            }));
            //Cargar los canales activos del canal recien conectado
            this.getRunningAgent(agent.id).channels = ids;
        }
    }

    /**
     * Obtiene un agente para la realización de un despliegue
     *
     * @param {*} channel
     * @returns
     */
    getFreeAgent(channel, ignoredAgents, specificAgents) {
        let agents = App.agents;

        //Filtrar en base a los nodos asignados del canal
        if (channel.agent_assign_mode && channel.agent_assign_mode !== "auto") {
            agents = lodash.filter(agents, (elm) => {
                if (Array.isArray(channel.agent_assign_mode)) {
                    return channel.agent_assign_mode.indexOf(elm.agent.id) !== -1;
                }
                return elm.agent.id === channel.agent_assign_mode;
            });
        }

        //Poder ignorar determinados agentes, util para redistribuir excluyendo ciertos elementos.
        if (ignoredAgents) {
            agents = lodash.filter(agents, (elm) => {
                return ignoredAgents.indexOf(elm.agent.id) === -1;
            });
        }
        //Poder especificar determinados agentes, util para redistribuir incluyendo solo ciertos elementos.
        if (specificAgents) {
            agents = lodash.filter(agents, (elm) => {
                return specificAgents.indexOf(elm.agent.id) !== -1;
            });
        }

        //Solo agentes aprobados y online
        agents = lodash.filter(
            agents,
            (elm) => elm.agent.approved === true && elm.agent.status === JUMAgent.STATUS_ONLINE
        );

        //Obtener el candidato mas viable dentro de la lista de nodos
        let candidate = lodash.reduce(
            agents,
            (result, value) => {
                if (result.id === null || result.count > value.channels.length) {
                    result.count = value.channels.length;
                    result.id = value.agent.id;
                }
                return result;
            },
            { id: null, count: 0 }
        );

        return candidate.id;
    }

    /**
     * Obtiene el agente que tiene desplegado a un canal concreto
     *
     * @param {*} channelId
     * @returns
     */
    getChannelCurrentAgent(channelId) {
        for (const idx in App.agents) {
            const elm = App.agents[idx];
            const chann = lodash.find(elm.channels, { id: channelId });

            if (chann) {
                return chann.agentId;
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
    getChannelCurrentState(channelId) {
        for (const idx in App.agents) {
            const elm = App.agents[idx];
            const chann = lodash.find(elm.channels, { id: channelId });

            if (chann) {
                return chann.status;
            }
        }
    }

    /**
     *
     * @param {*} channelId
     * @returns
     */
    async removeChannelFromCurrentAgents(channelId) {
        const currentAgent = this.getChannelCurrentAgent(channelId);
        const runnigAgent = this.getRunningAgent(currentAgent);

        let channels = lodash.filter(runnigAgent.channels, (el) => el.id !== channelId);
        this.addRunningAgent(currentAgent, { ...runnigAgent, channels: channels });

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
    async deployChannel(channel, route, ignoredAgents, specificAgents) {
        const candidate = this.getFreeAgent(channel, ignoredAgents, specificAgents);

        if (!candidate) {
            throw new Error("no_agent_available");
        }

        App.agentsManuallyDeployed[channel.id] = true;
        const response = await this.sendCommand(candidate, "/channel/deploy", {
            id: channel.id,
            name: channel.name,
            xmlContent: route,
            options: channel.options || {},
        });

        if (response.success) {
            let { channels } = this.getRunningAgent(candidate);
            channels.push({
                id: channel.id,
                name: channel.name,
                agentId: candidate,
                status: response.data,
            });
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
        const currentAgent = this.getChannelCurrentAgent(channel.id);
        App.agentsManuallyUndeployed[channel.id] = true;
        const response = await this.sendCommand(currentAgent, "/channel/undeploy", channel.id);

        if (response.success) {
            this.removeChannelFromCurrentAgents(channel.id);
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
            return this.formatLogs(response);
        }
        if (response.success) {
            return response.data;
        }
        throw new Error(response.data);
    }

    /**
     * Formatea los logs de un canal provenientes de varios agentes
     * @param {*} response
     * @returns
     */
    async formatLogs(response) {
        return lodash
            .map(response, (el) => {
                return `----  ${el.agentName}  ---- \n\n ${el.data}`;
            })
            .join("\n");
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
        const currentAgent = this.getChannelCurrentAgent(channel.id);

        const response = await this.sendCommand(currentAgent, "/channel/sendMessageToRoute", channel.id, {
            endpoint: endpoint,
            content: content,
        });

        if (response.success) {
            return response.data;
        }
        throw new Error(response.data);
    }

    /**
     *
     * @param {*} agentId
     */
    async redistributeAgentChannels(agentId) {
        //TODO
    }

    /**
     * Redespliega un canal en un agente diferente al actual
     *
     * @param {*} channelId
     */
    async assignChannelToAnotherAgent(channel) {
        const currentAgent = this.getChannelCurrentAgent(channel.id);

        await this.undeployChannel(channel.id);

        await this.deployChannel(channel.id, channel.last_deployed_route, [currentAgent]);
    }

    /**
     * Utiliza la propiedad agent_assign_mode para especificar el agente en el que desplegar el canal.
     *
     * @param {*} channel
     * @param {*} agentId
     */
    async assignChannelToSpecificAgent(channel, agentId) {
        await this.undeployChannel(channel.id);

        await this.deployChannel(channel, channel.last_deployed_route, null, [agentId]);
    }
}
