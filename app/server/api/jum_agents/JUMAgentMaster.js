import { AgentActionsCache, AgentSocketManager, JUMAgent, JUMAgentService } from ".";
import { IntegrationChannelService } from "../integration_channel";

import moment from "moment";
import lodash from "lodash";

import { Utils } from "lisco";

/**
 * Clase ejecutada únicamente en el hilo principal de la aplicación y encargada de la gestión de los eventos
 * y configuración de los elementos necesarios para gestionar las conexiones socketio
 */
class JUMAgentMaster {
    constructor() {
        this.service = new JUMAgentService();
    }

    redeployNotRunningChannels = lodash.debounce(() => {
        console.debug("Redeploying not running channels");
        this.service.redeployNotRunningChannels();
    }, process.env.JUM_AGENTS_REDEPLOY_DELAY, { 'leading': false, 'trailing': true });

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
                    socket.emit("messages", "Agent already online, forcing reconnect");
                    return this.service.disconnectAgent(agent.id);
                }
                console.log("Agent connected: " + agent.id);
                //On disconnect
                socket.on("disconnect", async (reason) => {
                    console.log("Agent disconnected! -> " + agent.id);
                    console.log(reason);

                    const prevAgent = await this.service.disconnectAgent(agent.id);

                    if (prevAgent && prevAgent.options && prevAgent.options.redistribute_on_lost) {
                        //Crear un timer para, pasado un tiempo, redistribuir el trabajo del agente si no se ha reconectado.
                        setTimeout(async () => {
                            try {
                                console.debug(`Checking if agent ${prevAgent.id} reconnected`);
                                if (!(await this.service.isRunning(prevAgent.id))) {
                                    console.debug(`Agent ${prevAgent.id} not reconnected, redistrib channels`);
                                    await this.service.redistributeAgentChannels(prevAgent);
                                }
                            } catch (ex) {
                                console.error(ex);
                            }
                        }, ((prevAgent.options && prevAgent.options.reconnect_timeout) || 30) * 1000);
                    }
                });

                //Se pone como Installing
                agent.status = JUMAgent.STATUS_INSTALLING;
                agent.last_socket_id = socket.id;
                agent.last_online_date = moment().toISOString();
                agent.current_channels = { list: [] };

                //Actualizar con la nueva info.
                await this.service.update(agent.id, agent);

                socket.emit("messages", "Connected!");
                //Configurar los elementos a escuchar.
                this.configureJUMEvents(socket);
                //Instala las dependencias en el agente
                if(agent.approved == true){
                    await this.service.reloadDependencies(agent);
                    await this.service.reloadCertificates(agent.id);
                }
                //Finalizada la instalación se marca como online
                agent.status = JUMAgent.STATUS_ONLINE;
                await this.service.update(agent.id, agent);

                //Recargar estados de los canales
                await this.service.loadAgentStatus(agent);

                //Esperar para que si mas de un agente se reconectan a la vez, de tiempo a que todo este sincronizado.
                await Utils.sleep(((agent.options && agent.options.autostart_delay) || 5) * 1000);

                //Redesplegar canales detenidos
                this.redeployNotRunningChannels();

            } catch (ex) {
                console.error(ex);
                socket.emit("messages", "An error ocurred:" + ex);
                this.service.disconnectAgent(agentId);
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

                try {
                    await this.service.redeployChannel(channel, [currentAgent.id]);
                } catch (ex) {
                    console.log(ex);
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
