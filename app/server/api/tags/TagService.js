// import { BaseService } from "../../integration/elastic";
import axios from "axios";
import { BaseService } from "lisco";
import { ConfigurationService } from "../configuration/ConfigurationService";
import { TagDao } from "./";
import { JSONPath } from "jsonpath-plus";

import lodash from "lodash";
import { MessageService } from "../messages";
export class TagService extends BaseService {
    constructor() {
        super(TagDao);
    }

    async listMessagesTagged(filters, start, limit, checkedNodes) {
        let tagFilter = {};
        if (!lodash.isEmpty(checkedNodes)) {
            tagFilter = {
                tag: {
                    type: "in",
                    value: checkedNodes,
                },
            };
        }
        const messageServ = new MessageService();
        const messages = messageServ.listTagged(filters, start, limit, tagFilter);

        return messages;
    }

    /**
     * Obtencion de una lista de elementos.
     *
     * filters, es opcional. Si no se pasan se devuelve lo que hay ;
     */
    async list(filters, start, limit, checkedNodes) {
        // const response = await super.list({ ...filters, ...tagFilter }, 0, 100000);
        // const tags = await this.getNodes(response.data);

        const [counters, datatags] = await Promise.all([
            this.dao.countAllNodes(filters),
            this.dao.getProcessedTags(filters),
        ]);

        // let tStart = Date.now();
        // const counters = await this.dao.countAllNodes({ ...filters, ...tagFilter });
        // console.log("Query1 Time: " + (Date.now() - tStart));
        // tStart = Date.now();
        // const datatags = await this.dao.getProcessedTags({ ...filters, ...tagFilter });
        // console.log("Query2 Time: " + (Date.now() - tStart));

        // tStart = Date.now();
        const tags = await this.processNodes(datatags, checkedNodes);
        // console.log("Process Time: " + (Date.now() - tStart));
        return {
            data: {...tags, counters},
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

    async processNodes(datatags, checkedNodes) {
        const connections = {};
        const nodes = {};

        await Promise.all(
            lodash.map(datatags, async (el) => {
                const { datatags: tags } = el;

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

    getNodes(tags) {
        // const tags_filtered = lodash.filter(tags, ({ tag }) => checkedNodes.indexOf(tag) !== -1);

        const groupedMsg = lodash.groupBy(tags, "message_id");
        const connections = {};
        const nodes = {};
        //Recorrer los mensajes agrupados por identificador (diferentes posibles tags)
        for (const el in groupedMsg) {
            const tagList = groupedMsg[el];

            //Obtener los datos principales del mensaje
            //Ordenar por fecha para mirar las direcciones
            const sorted = lodash.sortBy(tagList, "date_reception");
            for (let idx = 0; idx < sorted.length; idx++) {
                let prevMsg = sorted[idx];
                let msg = sorted[idx + 1];
                const sourceTag = prevMsg && prevMsg.tag;
                const targetTag = msg && msg.tag;
                //El anterior se obtiene como source y el actual como target
                this.addNode(nodes, sourceTag, "source");
                this.addNode(nodes, targetTag, "target");

                //!FIXME  revisar porque si es de un solo nodo no va a contar bien nunca
                if (prevMsg && msg) {
                    //Solo cuenta los source si hay destino
                    this.addNodeMessage(nodes, sourceTag, prevMsg && prevMsg.status + "_sent", el); //Contar los "source"
                }
                this.addNodeMessage(nodes, targetTag, msg && msg.status + "_rec", el); //Contar los "target"

                const connection = {
                    source: sourceTag,
                    target: targetTag,
                };
                if (msg && msg.status === "error") {
                    connection.style = { stroke: "red" };
                    connection.arrowHeadType = "arrowclosed";
                } else {
                    connection.style = { stroke: "green" };
                }

                const id = sourceTag + "-" + targetTag;
                // const selected = selection.indexOf(msg && msg.message_id) !== -1;
                // if (selected) {
                // }
                //Solo añade la conexion si hay nodos que conectar o si se esta intentando visualizar uno/varios mensajes concretos
                if (prevMsg && msg /*&& (lodash.isEmpty(selection) || selected)*/) {
                    this.addConnection(connections, id, connection);
                }
            }
        }

        return { connections, nodes };
    }

    async healthcheck(identifier) {
        const confServ = new ConfigurationService();
        const { data: tagDefinition } = await confServ.getModelData("tag", identifier);

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
