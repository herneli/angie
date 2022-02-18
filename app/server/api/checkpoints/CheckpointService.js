// import { BaseService } from "../../integration/elastic";
import axios from "axios";
import { BaseService } from "lisco";
import { ConfigurationService } from "../configuration/ConfigurationService";
import { CheckpointDao } from ".";
import { JSONPath } from "jsonpath-plus";

import lodash from "lodash";
import { MessageService } from "../messages";
export class CheckpointService extends BaseService {
    constructor() {
        super(CheckpointDao);
    }

    async listMessagesCheckpointed(filters, start, limit, checkedNodes) {
        let checksFilter = {};
        if (!lodash.isEmpty(checkedNodes)) {
            checksFilter = {
                check_tag: {
                    type: "in",
                    value: checkedNodes,
                },
            };
        }
        const messageServ = new MessageService();
        const messages = messageServ.listTagged(filters, start, limit, checksFilter);

        return messages;
    }

    /**
     * Obtencion de una lista de elementos.
     *
     * filters, es opcional. Si no se pasan se devuelve lo que hay ;
     */
    async list(filters, start, limit, checkedNodes) {
        const [counters, checkpoints] = await Promise.all([
            this.dao.countAllNodes(filters),
            this.dao.getProcessedCheckpoints(filters),
        ]);

        // let tStart = Date.now();
        // const counters = await this.dao.countAllNodes(filters);
        // console.log("Query1 Time: " + (Date.now() - tStart));
        // tStart = Date.now();
        // const checkpoints = await this.dao.getProcessedCheckpoints(filters);
        // console.log("Query2 Time: " + (Date.now() - tStart));

        // tStart = Date.now();
        const checks = await this.processNodes(checkpoints, checkedNodes);
        // console.log("Process Time: " + (Date.now() - tStart));
        return {
            data: { ...checks, counters },
        };
    }

    addNode(nodes, key, as) {
        if (!key) return;
        if (!nodes[key]) {
            nodes[key] = {};
        }
        nodes[key][as] = true;
    }

    addNodeMessage(nodes, key, type, id) {
        if (!key) return;
        if (!nodes[key]) {
            nodes[key] = {};
        }
        if (!nodes[key][type]) {
            nodes[key][type] = [];
        }
        nodes[key][type].push(id);
    }

    addConnection(connections, key, data, count) {
        if (!connections[key]) {
            connections[key] = {
                id: key,
                animated: true,
                type: "floating",
                label: count,
                arrowHeadType: "arrow",
                style: { stroke: "green" },
            };
        }
        connections[key] = { ...connections[key], ...data };
    }

    async processNodes(checkpoints, checkedNodes) {
        const connections = {};
        const nodes = {};

        await Promise.all(
            lodash.map(checkpoints, async (el) => {
                const { checks: tags } = el;

                let tagList = tags ? tags.split("-") : [];
                if (!lodash.isEmpty(checkedNodes)) {
                    tagList = lodash.filter(tagList, (el) => checkedNodes.indexOf(el) !== -1);
                }

                for (let idx = 0; idx < tagList.length; idx++) {
                    let src = tagList[idx];
                    let tgt = tagList[idx + 1];

                    this.addNode(nodes, src, "source");
                    this.addNode(nodes, tgt, "target");

                    const connection = {
                        source: src,
                        target: tgt,
                    };
                    if (el.status === "error") {
                        connection.style = { stroke: "red" };
                        connection.arrowHeadType = "arrowclosed";
                    } else {
                        connection.style = { stroke: "green" };
                    }
                    const id = `${src}-${tgt}`;
                    if (src && tgt) {
                        //!FIXME quizas seria mejor hacer una sola query para contar todas las conexiones
                        // const [counters] = await this.dao.countMessagesByConnection(filters, id);
                        //parseInt(counters && counters.sent) + parseInt(counters && counters.error)
                        this.addConnection(connections, id, connection, 0);
                    }
                }
            })
        );

        return { connections, nodes };
    }

    async healthcheck(identifier) {
        const confServ = new ConfigurationService();
        const { data: tagDefinition } = await confServ.getModelData("checkpoint", identifier);

        if (!tagDefinition || !tagDefinition.healthcheck) {
            return null;
        }
        const { healthcheck } = tagDefinition;
        const response = {
            type: healthcheck.response_type,
        };
        switch (healthcheck.response_type) {
            case "alive":
                response.status = await this.aliveHealthcheck(healthcheck);
                break;
            case "data":
                response.value = await this.dataHealthCkeck(healthcheck);
                break;
            default:
                break;
        }
        return response;
    }

    async aliveHealthcheck(config) {
        try {
            const response = await axios({
                url: config.url,
                method: config.method || "GET",
            });
            //TODO parse response? check code¿
            return true;
        } catch (ex) {
            return false;
        }
    }
    async dataHealthCkeck(config) {
        try {
            const response = await axios({
                url: config.url,
                method: config.method || "GET",
            });

            return JSONPath({ path: config.response_property, json: response.data });
        } catch (ex) {
            return "-";
        }
    }
}
