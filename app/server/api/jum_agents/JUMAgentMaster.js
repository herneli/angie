import { AgentActionsCache, AgentSocketManager, JUMAgent, JUMAgentService } from ".";
import { IntegrationChannelService } from "../integration_channel";

import moment from "moment";

/**
 * Clase ejecutada únicamente en el hilo principal de la aplicación y encargada de la gestión de los eventos
 * y configuración de los elementos necesarios para gestionar las conexiones socketio
 */
class JUMAgentMaster {
    constructor() {
        this.service = new JUMAgentService();
    }

    /**
     * Metodo encargado de la lógica principal de conexión para los agentes
     */
    async listenForAgents(io) {
        //Resetear al inicio todos los agents marcándolos como offline
        await this.service.releaseAll();
        AgentSocketManager.configureMasterSocketEvents();

        //Middleware para trazar las incoming connections
        io.use((socket, next) => {
            let agentId = socket.handshake.query.id;

            console.log(`Received connection from ${agentId}@${socket.id}`);
            next();
        });
        //Middleware para la validación del token
        io.use((socket, next) => this.service.validateToken(socket, next));

        //Evento desencadenado en cada conexion de un nuevo agent
        io.on("connection", async (socket) => {
            let agentId = socket.handshake.query.id;
            try {
                let agent = await this.service.createAgentIfNotExists(agentId, socket);
                if (await this.service.isRunning(agent.id)) {
                    console.log("Already running");
                    socket.emit("messages", "Agent already online");
                    //TODO improve already running mechanic
                    return this.service.disconnectAgent(agent.id, false);
                }
                console.log("Agent connected: " + agent.id);
                //On disconnect
                socket.on("disconnect", async (reason) => {
                    console.log("Agent disconnected! -> " + agent.id);
                    console.log(reason);
                    //TODO check disconnect mechanics
                    await this.service.disconnectAgent(agent.id, true);
                });

                //Se pone como Online
                agent.status = JUMAgent.STATUS_ONLINE;
                agent.last_socket_id = socket.id;
                agent.last_online_date = moment().toISOString();
                agent.current_channels = { list: [] };

                //Actualizar con la nueva info.
                await this.service.update(agent.id, agent);

                socket.emit("messages", "Connected!");
                //Configurar los elementos a escuchar.
                this.configureJUMEvents(socket);

                await this.service.loadAgentStatus(agent);
            } catch (ex) {
                console.error(ex);
                socket.emit("messages", "An error ocurred:" + ex);
                this.service.disconnectAgent(agentId, false);
            }
        });
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
        AgentSocketManager.listenCommand(socket, "/master/ping", (message, callback) => {
            console.log("Received on server");
            return callback && callback("OK");
        });
        AgentSocketManager.listenCommand(socket, "/channel/failure", (agentId, channelId, callback) => {
            console.log("Received on server");
            return callback && callback("OK");
        });
        AgentSocketManager.listenCommand(socket, "/channel/started", async (agentId, channelId, callback) => {
            //Ignoramos aquellos desplegados de forma manual
            if (!(await AgentActionsCache.isTrue("deploy", channelId))) {
                console.log(`Started ${channelId} on ${agentId} by itself.`);
                //TODO check if channel running in another?

                //Recargar los estados de ese agente para sincronia
                await this.service.loadAgentStatus(receivedFrom);
            } else {
                //Una vez desencadenado el evento de despliegue sobre ese canal se quita la marca de despliegue
                await AgentActionsCache.resetAction("deploy", channelId);
            }

            return callback && callback("OK");
        });
        AgentSocketManager.listenCommand(socket, "/channel/stopped", async (agentId, channelId, callback) => {
            if (!(await AgentActionsCache.isTrue("undeploy", channelId))) {
                console.error(`Channel ${channelId} stopped unexpectedly.`);
                //Obtener el agent en el que se esperaba que estuviese desplegado
                const currentAgent = await this.service.getChannelCurrentAgent(channelId);

                //Desmarcarlo como "running" en el agente actual
                await this.service.removeChannelFromCurrentAgents(channelId);

                const channelService = new IntegrationChannelService();
                const channel = await channelService.getChannelById(channelId);

                const policy = channel.deployment_options && channel.deployment_options.restart_policy;
                if (policy === "any_agent") {
                    //Obtener un candidato nuevo y desplegarlo en el
                    const candidate = await this.service.getFreeAgent(channel, [currentAgent.id]);
                    await this.service.deployChannel(channel, channel.last_deployed_route, candidate);
                }
            } else {
                //Una vez desencadenado el evento de despliegue sobre ese canal se quita la marca de despliegue
                await AgentActionsCache.resetAction("undeploy", channelId);
            }
            return callback && callback("OK");
        });
    }
}

export default new JUMAgentMaster();
