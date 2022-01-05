import { expect } from "chai";
import { getTracker } from "knex-mock-client";

import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { Server, Socket } from "socket.io";
import { App, Utils } from "lisco";
import { JUMAgent, JUMAgentService } from "../../app/server/api/jum_agents";

import { v4 as uuid_v4 } from "uuid";
import ManualActions from "../../app/server/api/jum_agents/ManualActions";

const secret = process.env.JUM_AGENTS_SECRET;

let PORT;

const channel = {
    id: "d9d69b3f-0b5a-4379-9122-1f3436ddbd14",
    nodes: [],
};

const configureQueryOnce = (tracker, id, approved, status, client) => {
    //Responder a las querys de agentes con el socket conectado
    tracker.on
        .select('select * from "jum_agent"')
        .responseOnce([{ id, approved: approved, status: status, last_socket_id: client && client.id }]);
};
const configureOnlineCheck = (tracker, id, approved, status, client) => {
    tracker.on
        .select(({ sql }) => {
            return sql.indexOf('"status" =') !== -1 && sql.indexOf('and "id"') !== -1;
        })
        .responseOnce(id && { id, approved: approved, status: status, last_socket_id: client && client.id });
};

const configurePreConnection = async (tracker, id) => {
    //Responder a la query de "isRunning" como offline
    configureOnlineCheck(tracker, null);
    //Obtener la lista una primera vez
    configureQueryOnce(tracker, id, true, JUMAgent.STATUS_ONLINE);

    await Utils.sleep(100);
};

const configureAfterConnection = async (tracker, id, approved, status, client, once) => {
    //Una vez conectado, responder como online
    configureOnlineCheck(tracker, id, approved, status, client);

    if (once === true) {
        //Responder a las querys de agentes con el socket conectado
        configureQueryOnce(tracker, id, approved, status, client);
    } else {
        //Responder a las querys de agentes con el socket conectado
        tracker.on
            .select('select * from "jum_agent"')
            .response([{ id, approved: approved, status: status, last_socket_id: client && client.id }]);
    }

    await Utils.sleep(100);
};

const configureCache = (tracker) => {
    tracker.on.update("cache").response({ key: "", data: true });
    tracker.on.select('from "cache" where "key').response({ key: "", data: true });
};

describe("JUMAgentService", () => {
    let tracker, id;

    const connectClient = (overrideToken) => {
        //Conectar cliente al servidor
        return Client(`http://localhost:${PORT}`, {
            auth: {
                token: overrideToken || secret,
            },
            transports: ["websocket"],
            query: {
                id: id,
                name: "JUM1",
                platform: process.platform,
            },
        });
    };

    before((done) => {
        tracker = getTracker();

        //Crear server dinámico para el test
        const httpServer = createServer();
        App.server.app.io = new Server(httpServer, { transports: ["websocket"] });
        httpServer.listen(async () => {
            PORT = httpServer.address().port;

            try {
                tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);
                tracker.on
                    .select('select * from "jum_agent')
                    .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

                const service = new JUMAgentService();
                await service.listenForAgents(App.server.app.io);

                tracker.reset();
                await Utils.sleep(200);
                done();
            } catch (ex) {
                console.log(ex);
                done(ex);
            }
        });
    });

    afterEach(async () => {
        tracker.reset();
    });

    beforeEach(() => {
        id = uuid_v4();
    });

    after(() => {
        //Detener server
        App.server.app.io.close();
    });

    it("#releaseAll", async () => {
        const service = new JUMAgentService();

        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

        await service.releaseAll();

        const updateHistory = tracker.history.update;
        expect(updateHistory).to.have.lengthOf(1);
        expect(updateHistory[0].method).to.eq("update");
    });

    it("#createAgentIfNotExists||NotExists", async () => {
        const service = new JUMAgentService();

        tracker.on.insert("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);
        tracker.on.select('select * from "jum_agent').response([]);

        const agent = await service.createAgentIfNotExists(id);

        expect(agent).not.to.be.null;

        const insertHistory = tracker.history.insert;
        expect(insertHistory).to.have.lengthOf(1);
        expect(insertHistory[0].method).to.eq("insert");
    });

    it("#createAgentIfNotExists||Exists", async () => {
        const service = new JUMAgentService();

        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

        const agent = await service.createAgentIfNotExists(id);

        expect(agent).not.to.be.null;

        const insertHistory = tracker.history.insert;
        expect(insertHistory).to.have.lengthOf(0);
    });

    it("#agentConnection||Approved", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_ONLINE }]);
        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("messages", (arg) => {
                console.log(arg);
            });
            client.on("connect", async () => {
                await configureAfterConnection(tracker, id, true, JUMAgent.STATUS_ONLINE, client);

                try {
                    const service = new JUMAgentService();

                    const agents = await service.getRunningAgents();
                    expect(agents).not.to.be.null;
                    expect(agents).not.to.be.empty;
                    expect(agents[0]).not.to.be.null;
                    expect(agents[0].status).to.be.eq(JUMAgent.STATUS_ONLINE);

                    client.close();
                    await Utils.sleep(200);
                    resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||NotApproved", async () => {
        tracker.on.update("jum_agent").response([]);
        tracker.on.insert("jum_agent").response([{ id, approved: false, status: JUMAgent.STATUS_OFFLINE }]);

        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                await configureAfterConnection(tracker, id, false, JUMAgent.STATUS_ONLINE, client);

                try {
                    const service = new JUMAgentService();
                    const agents = await service.getRunningAgents();
                    expect(agents).not.to.be.null;
                    expect(agents).not.to.be.empty;
                    expect(agents[0]).not.to.be.null;
                    expect(agents[0].status).to.be.eq(JUMAgent.STATUS_ONLINE);
                    expect(agents[0].approved).to.be.false;

                    client.close();
                    await Utils.sleep(200);
                    resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||InvalidToken", async () => {
        tracker.on.update("jum_agent").response([]);
        tracker.on.select('select * from "jum_agent').response([]);
        tracker.on.insert("jum_agent").response([{ id, approved: false, status: JUMAgent.STATUS_OFFLINE }]);

        const client = connectClient("badtoken");

        return new Promise((resolve, reject) => {
            client.on("connect_error", async (err) => {
                try {
                    const service = new JUMAgentService();
                    const agents = await service.getRunningAgents();
                    expect(agents).not.to.be.null;
                    expect(agents).to.be.empty;

                    expect(err).to.be.an("Error");
                    expect(err.message).to.eq("not_authorized");
                    expect(err.data).to.have.property("content");
                    expect(err.data.content).to.eq("Invalid token.");

                    client.close();
                    await Utils.sleep(200);
                    resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||CommandFromServer", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise(async (resolve, reject) => {
            client.on("custom", async (data, callback) => {
                try {
                    expect(data).not.to.be.null;
                    client.close();
                    await Utils.sleep(200);
                    resolve();
                } catch (ex) {
                    reject(ex);
                }
                return callback("ok");
            });

            client.on("connect", async () => {
                try {
                    await configureAfterConnection(tracker, id, true, JUMAgent.STATUS_ONLINE, client);

                    const service = new JUMAgentService();
                    await service.sendCommand(id, "custom", {
                        test: "test",
                    });
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||ClientCommand", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                try {
                    await configureAfterConnection(tracker, id, true, JUMAgent.STATUS_ONLINE, client);

                    console.log("Emitting");
                    client.emit("/master/ping", "hello", async (result) => {
                        try {
                            console.log(result);
                            expect(result).to.be.eq("OK");

                            client.close();
                            await Utils.sleep(200);
                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }
                    });
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||UnapprovedClientCommand", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: false, status: JUMAgent.STATUS_OFFLINE }]);

        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                try {
                    await configureAfterConnection(tracker, id, false, JUMAgent.STATUS_ONLINE, client);

                    console.log("Emitting");
                    client.emit("/master/ping", "A", async (result) => {
                        try {
                            console.log(result);
                            expect(result).to.be.eq("agent_not_approved");

                            client.close();
                            await Utils.sleep(200);

                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }
                    });
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||ClientDisconnection", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                await configureAfterConnection(tracker, id, true, JUMAgent.STATUS_ONLINE, client, true);

                //Otra comprobacion de estado
                configureQueryOnce(tracker, id, true, JUMAgent.STATUS_ONLINE, client);

                await Utils.sleep(100);
                try {
                    const service = new JUMAgentService();
                    //Responder a las querys de agentes con el socket conectado
                    configureQueryOnce(tracker, id, true, JUMAgent.STATUS_ONLINE, client);
                    configureQueryOnce(tracker, id, true, JUMAgent.STATUS_ONLINE, client);

                    let agents = await service.getRunningAgents();
                    expect(agents).not.to.be.null;
                    expect(agents).not.to.be.empty;
                    expect(agents[0]).not.to.be.null;
                    expect(agents[0].status).to.be.eq(JUMAgent.STATUS_ONLINE);

                    client.close();
                    await Utils.sleep(200);

                    //Responder a las querys de agentes con el socket conectado
                    tracker.on.select('select * from "jum_agent"').responseOnce([]);

                    agents = await service.getRunningAgents();
                    expect(agents).to.be.empty;
                    expect(agents[0]).to.be.undefined;
                    resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||ApproveClient", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);
        await configurePreConnection(tracker, id);

        const client = connectClient();

        client.on("/agent/status", async (callback) => {
            callback({ success: true, data: null });
        });

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                try {
                    await configureAfterConnection(tracker, id, false, JUMAgent.STATUS_ONLINE, client, true);

                    configureQueryOnce(tracker, id, false, JUMAgent.STATUS_ONLINE, client);

                    await Utils.sleep(100);
                    console.log("Emitting");
                    client.emit("/master/ping", "Test", async (result) => {
                        try {
                            console.log(result);
                            expect(result).to.be.eq("agent_not_approved");

                            configureQueryOnce(tracker, id, false, JUMAgent.STATUS_ONLINE, client);

                            await Utils.sleep(100);

                            const service = new JUMAgentService();

                            configureOnlineCheck(tracker, id, false, JUMAgent.STATUS_ONLINE, client);
                            configureQueryOnce(tracker, id, true, JUMAgent.STATUS_ONLINE, client);

                            await service.approveAgent(id);

                            configureOnlineCheck(tracker, id, true, JUMAgent.STATUS_ONLINE, client);
                            configureQueryOnce(tracker, id, true, JUMAgent.STATUS_ONLINE, client);
                            await Utils.sleep(200);

                            const agent = await service.loadById(id);

                            expect(agent).not.to.be.undefined;

                            resolve();
                        } catch (ex) {
                            console.error(ex);
                            reject(ex);
                        }
                    });
                } catch (ex) {
                    console.error(ex);
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||getCandidate", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_ONLINE }]);

        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                try {
                    await configureAfterConnection(tracker, id, true, JUMAgent.STATUS_ONLINE, client);

                    const service = new JUMAgentService();
                    const agent = await service.getFreeAgent(channel);

                    expect(agent).not.to.be.undefined;
                    expect(agent).not.to.be.null;
                    expect(agent).to.be.eq(id);

                    client.close();
                    await Utils.sleep(200);
                    return resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||deployChannel", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_ONLINE }]);
        configureCache(tracker);
        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("/channel/deploy", async (jumchannel, callback) => {
                expect(jumchannel).not.to.be.null;
                expect(jumchannel).not.to.be.undefined;

                callback({ success: true, data: { status: "Started" } });
            });
            client.on("connect", async () => {
                try {
                    await configureAfterConnection(tracker, id, true, JUMAgent.STATUS_ONLINE, client);

                    const service = new JUMAgentService();
                    const candidate = await service.getFreeAgent(channel);
                    const response = await service.deployChannel(channel, "", candidate);

                    expect(response).not.to.be.undefined;
                    expect(response).not.to.be.null;

                    expect(response.status).to.be.eq("Started");

                    client.close();
                    await Utils.sleep(200);
                    return resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||undeployChannel", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_ONLINE }]);
        configureCache(tracker);
        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("/channel/deploy", async (jumchannel, callback) => {
                expect(jumchannel).not.to.be.null;
                expect(jumchannel).not.to.be.undefined;

                callback({ success: true, data: { status: "Started" } });
            });
            client.on("/channel/undeploy", async (jumchannel, callback) => {
                expect(jumchannel).not.to.be.null;
                expect(jumchannel).not.to.be.undefined;

                callback({ success: true, data: "DONE" });
            });
            client.on("connect", async () => {
                try {
                    configureAfterConnection(tracker, id, true, JUMAgent.STATUS_ONLINE, client, true);

                    //Responder a las querys de agentes con el socket conectado
                    tracker.on.select('select * from "jum_agent"').response([
                        {
                            id,
                            approved: true,
                            status: JUMAgent.STATUS_ONLINE,
                            last_socket_id: client && client.id,
                            current_channels: { list: [channel] },
                        },
                    ]);

                    await Utils.sleep(100);

                    const service = new JUMAgentService();
                    const candidate = await service.getFreeAgent(channel);
                    const res = await service.deployChannel(channel, "", candidate);

                    await Utils.sleep(200);

                    const response = await service.undeployChannel(channel);

                    expect(response).not.to.be.undefined;

                    expect(response).to.be.eq("DONE");

                    client.close();
                    await Utils.sleep(200);
                    return resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||channelLogs", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_ONLINE }]);
        configureCache(tracker);
        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("/channel/deploy", async (jumchannel, callback) => {
                expect(jumchannel).not.to.be.null;
                expect(jumchannel).not.to.be.undefined;

                callback({ success: true, data: { status: "Started" } });
            });

            client.on("/channel/log", async (jumchannel, callback) => {
                expect(jumchannel).not.to.be.null;
                expect(jumchannel).not.to.be.undefined;

                callback({ success: true, data: "LOG!" });
            });
            client.on("connect", async () => {
                try {
                    await configureAfterConnection(tracker, id, true, JUMAgent.STATUS_ONLINE, client);

                    const service = new JUMAgentService();
                    const candidate = await service.getFreeAgent(channel);
                    const res = await service.deployChannel(channel, "", candidate);

                    await Utils.sleep(100);

                    const response = await service.channelLogs(channel);

                    expect(response).not.to.be.undefined;
                    expect(response).not.to.be.null;

                    expect(response).to.be.an("array");

                    client.close();
                    await Utils.sleep(200);
                    return resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||sendMessageToRoute", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_ONLINE }]);
        configureCache(tracker);
        await configurePreConnection(tracker, id);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("/channel/deploy", async (jumchannel, callback) => {
                expect(jumchannel).not.to.be.null;
                expect(jumchannel).not.to.be.undefined;

                callback({ success: true, data: { status: "Started" } });
            });

            client.on("/channel/sendMessageToRoute", async (channelId, message, callback) => {
                expect(channelId).not.to.be.null;
                expect(channelId).not.to.be.undefined;

                expect(message).not.to.be.null;
                expect(message).not.to.be.undefined;

                callback({ success: true, data: "DONE" });
            });
            client.on("connect", async () => {
                try {
                    configureAfterConnection(tracker, id, true, JUMAgent.STATUS_ONLINE, client, true);

                    //Responder a las querys de agentes con el socket conectado
                    tracker.on.select('select * from "jum_agent"').response([
                        {
                            id,
                            approved: true,
                            status: JUMAgent.STATUS_ONLINE,
                            last_socket_id: client && client.id,
                            current_channels: { list: [channel] },
                        },
                    ]);
                    await Utils.sleep(100);

                    const service = new JUMAgentService();
                    const candidate = await service.getFreeAgent(channel);
                    const res = await service.deployChannel(channel, "", candidate);

                    await Utils.sleep(200);

                    const response = await service.sendMessageToRoute(channel, "direct://test", "test");

                    expect(response).not.to.be.undefined;
                    expect(response).not.to.be.null;

                    expect(response).to.be.eq("DONE");

                    client.close();
                    await Utils.sleep(200);
                    return resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);
});
