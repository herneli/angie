import lodash from "lodash";
import { App } from "lisco";

class AgentSocketManager {
    constructor() {
        this.private = new AgentSocketManagerPrivate();
    }
    /**
     * Estos eventos se escuchan desde el nodo padre para permitir acceder a los hijos a la lista de sockets
     *
     *
     * Su implementación es válida para modo cluster y modo normal pero se realiza de esta forma para habilitar el modo cluster.
     *
     * @param {*} io
     */
    configureMasterSocketEvents() {
        App.events.on("agent-disconnect", async (msg, callback) => {
            // console.log("Disconnecting socket on Master");
            try {
                await this.private.disconnectSocket(msg.socketId);
                if (callback) return callback({ success: true });
            } catch (ex) {
                if (callback) return callback(null);
            }
        });

        App.events.on("agent-sendCommand", async (msg, callback) => {
            // console.log("Sending socket command on Master");
            try {
                const response = await this.private.sendCommand(...msg.args);
                if (callback) return callback(response);
            } catch (ex) {
                if (callback) return callback({ sucess: false, data: ex });
            }
        });
        App.events.on("agent-sendToAll", async (msg, callback) => {
            // console.log("Broadcasting command on Master");
            try {
                const response = await this.private.sendToAll(...msg.args);
                if (callback) return callback(response);
            } catch (ex) {
                if (callback) return callback(ex);
            }
        });
    }

    /**
     * Emite el evento de desconexión de un agente para forzar la desconexión de su socket.
     *
     * El evento se captura por el nodo master (el único que ejecuta el método de escucha)
     *
     * @returns
     */
    async disconnectSocket(socketId) {
        return new Promise((resolve) => {
            App.events.emit("agent-disconnect", { socketId: socketId }, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Emite un comando en un agente concreto (el primer parametro será el identificador del agente)
     *
     * El evento se captura por el nodo master (el único que ejecuta el método de escucha)
     */
    async sendCommand() {
        let args = [...arguments];

        return new Promise((resolve) => {
            App.events.emit("agent-sendCommand", { args: args }, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Emite un comando a todos los agentes
     *
     * El evento se captura por el nodo master (el único que ejecuta el método de escucha)
     */
    async sendToAll() {
        let args = [...arguments];

        return new Promise((resolve) => {
            App.events.emit("agent-sendToAll", { args: args }, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Método que activa una escucha sobre un comando
     *
     * @param {*} agentId
     * @param {*} commandName
     * @param {*} func
     */
    async listenCommand(socket, commandName, func) {
        try {
            socket.off(commandName);
        } catch (ex) {}

        socket.on(commandName, async function () {
            let args = [...arguments];

            return func(...args);
        });
    }
}

/**
 * Clase con métodos privados a los que no se deberá de acceder externamente.
 *
 */
class AgentSocketManagerPrivate {
    /**
     * Get connected socket via its id
     *
     * @param {*} socketId
     * @returns
     */
    async getSocket(socketId) {
        const io = App.server.app.io;
        const sockets = await io.fetchSockets();
        return lodash.find(sockets, { id: socketId });
    }

    /**
     * Get connected socket via its id
     *
     * @param {*} socketId
     * @returns
     */
    async getSockets() {
        const io = App.server.app.io;
        return io.fetchSockets();
    }

    /**
     * Método que desconecta a un agent en base al id.
     *
     * @param {*} id
     */
    async disconnectSocket(socketId) {
        try {
            const socket = await this.getSocket(socketId);

            //Force socket close
            if (socket && socket.disconnect) {
                socket.disconnect(true);
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    /**
     * Método que envía un comando a un agent
     *
     * @param {*} agentId
     * @param {*} commandName
     * @param {*} data
     * @returns
     */
    async sendCommand(socketId) {
        let args = lodash.drop(arguments, 1);

        const socket = await this.getSocket(socketId);

        const seconds = 30;
        const timeout = new Promise((resolve, reject) =>
            setTimeout(() => reject(`Timed out after ${seconds} s.`), seconds * 1000)
        );
        const promise = new Promise((resolve, reject) => {
            if (!socket) return reject("socket_not_connected");

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
        return Promise.race([promise, timeout]);
    }

    /**
     * Envia un comando a todos los agentes esperando su respuesta
     *
     * @returns
     */
    async sendToAll() {
        let args = [...arguments];

        let commands = [];
        const sockets = await this.getSockets();
        for (const socket of sockets) {
            commands.push(this.sendCommand(socket.id, ...args));
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
        throw "Need reimplementation";
        // let args = [...arguments];

        // return new Promise((resolve, reject) => {
        //     try {
        //         args.push((data) => {
        //             if (data.error) {
        //                 return reject(data);
        //             }
        //             return resolve(data);
        //         });

        //         const io = App.server.app.io;
        //         io.emit(...args);
        //     } catch (ex) {
        //         reject(ex);
        //     }
        // });
    }
}

export default new AgentSocketManager();
