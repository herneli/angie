import { expect } from "chai";
import { getTracker } from "knex-mock-client";

import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { Server } from "socket.io";
import { App, Utils } from "lisco";
import { JUMAgent, JUMAgentService } from "../../app/server/api/jum_agents";

import { v4 as uuid_v4 } from "uuid";

const secret = process.env.JUM_AGENTS_SECRET;

let PORT;

const channel = {
    id: "d9d69b3f-0b5a-4379-9122-1f3436ddbd14",
    nodes: [],
};

describe("JUMAgentService", () => {
    let tracker, id;

    const connectClient = (overrideToken) => {
        //Conectar cliente al servidor
        return Client(`http://localhost:${PORT}`, {
            auth: {
                token: overrideToken || secret,
            },
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
        App.server.app.io = new Server(httpServer);
        httpServer.listen(async () => {
            PORT = httpServer.address().port;

            try {
                tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);
                tracker.on
                    .select('select * from "jum_agent')
                    .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

                const service = new JUMAgentService();
                await service.listenForAgents();

                tracker.reset();
                await Utils.sleep(200);
                done();
            } catch (ex) {
                console.log(ex);
                done(ex);
            }
        });
    });

    afterEach(() => {
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
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("messages", (arg) => {
                console.log(arg);
            });
            client.on("connect", async () => {
                await Utils.sleep(100);

                try {
                    expect(App.agents).not.to.be.null;
                    expect(App.agents).not.to.be.empty;
                    expect(App.agents[id]).not.to.be.null;
                    expect(App.agents[id].agent.status).to.be.eq(JUMAgent.STATUS_ONLINE);

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
        tracker.on.select('select * from "jum_agent').response([]);
        tracker.on.insert("jum_agent").response([{ id, approved: false, status: JUMAgent.STATUS_OFFLINE }]);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                await Utils.sleep(100);

                try {
                    expect(App.agents).not.to.be.null;
                    expect(App.agents).not.to.be.empty;
                    expect(App.agents[id]).not.to.be.null;
                    expect(App.agents[id].agent.status).to.be.eq(JUMAgent.STATUS_ONLINE);
                    expect(App.agents[id].agent.approved).to.be.false;

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
                    expect(App.agents).not.to.be.null;
                    expect(App.agents).to.be.empty;

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
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

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

            try {
                await Utils.sleep(200);

                const service = new JUMAgentService();
                await service.sendCommand(id, "custom", {
                    test: "test",
                });
            } catch (ex) {
                reject(ex);
            }
        });
    }).timeout(10000);

    it("#agentConnection||ClientCommand", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                try {
                    console.log("Emitting");
                    client.emit("/channel/started", "A", "B", async (result) => {
                        try {
                            console.log(result);
                            expect(result).to.be.eq("OK");

                            client.close();
                            await Utils.sleep(300);
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
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: false, status: JUMAgent.STATUS_OFFLINE }]);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                try {
                    console.log("Emitting");
                    client.emit("/channel/started", "A", "B", async (result) => {
                        try {
                            console.log(result);
                            expect(result).to.be.eq("agent_not_approved");

                            client.close();
                            await Utils.sleep(300);

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
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                await Utils.sleep(100);

                try {
                    expect(App.agents).not.to.be.null;
                    expect(App.agents).not.to.be.empty;
                    expect(App.agents[id]).not.to.be.null;
                    expect(App.agents[id].agent.status).to.be.eq(JUMAgent.STATUS_ONLINE);

                    client.close();
                    await Utils.sleep(300);

                    expect(App.agents).to.be.empty;
                    expect(App.agents[id]).to.be.undefined;
                    resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }).timeout(10000);

    it("#agentConnection||ApproveClient", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: false, status: JUMAgent.STATUS_OFFLINE }]);
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: false, status: JUMAgent.STATUS_OFFLINE }]);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                try {
                    console.log("Emitting");
                    client.emit("/channel/started", "", { test: "test" }, async (result) => {
                        try {
                            console.log(result);
                            expect(result).to.be.eq("agent_not_approved");

                            await Utils.sleep(100);

                            const service = new JUMAgentService();

                            service.approveAgent(id);

                            await Utils.sleep(200);

                            client.emit("/channel/started", "", { test: "test" }, async (result) => {
                                console.log(result);
                                expect(result).to.be.eq("OK");

                                client.close();
                                await Utils.sleep(200);

                                resolve();
                            });
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

    it("#agentConnection||getCandidate", async () => {
        tracker.on.update("jum_agent").response([{ id, approved: true, status: JUMAgent.STATUS_ONLINE }]);
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("connect", async () => {
                try {
                    await Utils.sleep(300);

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
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

        const client = connectClient();

        return new Promise((resolve, reject) => {
            client.on("/channel/deploy", async (jumchannel, callback) => {
                expect(jumchannel).not.to.be.null;
                expect(jumchannel).not.to.be.undefined;

                callback({ success: true, data: { status: "Started" } });
            });
            client.on("connect", async () => {
                try {
                    await Utils.sleep(100);

                    const service = new JUMAgentService();
                    const response = await service.deployChannel(channel, "");

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
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

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
                    await Utils.sleep(100);

                    const service = new JUMAgentService();
                    await service.deployChannel(channel, "");

                    await Utils.sleep(100);

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
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

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
                    await Utils.sleep(100);

                    const service = new JUMAgentService();
                    await service.deployChannel(channel, "");

                    await Utils.sleep(100);

                    const response = await service.channelLogs(channel);

                    expect(response).not.to.be.undefined;
                    expect(response).not.to.be.null;

                    expect(response).to.be.eq("LOG!");

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
        tracker.on
            .select('select * from "jum_agent')
            .response([{ id, approved: true, status: JUMAgent.STATUS_OFFLINE }]);

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
                    await Utils.sleep(100);

                    const service = new JUMAgentService();
                    await service.deployChannel(channel, "");

                    await Utils.sleep(100);

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
