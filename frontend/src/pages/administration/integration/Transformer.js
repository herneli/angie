import lodash from "lodash";
import Handlebars from "handlebars";

import axios from "axios";

import * as queryString from "query-string";
import beautify from "xml-beautifier";

Handlebars.registerHelper("safe", function (inputData) {
    return new Handlebars.SafeString(inputData);
});
Handlebars.registerHelper("querystring", function (inputData) {
    return new Handlebars.SafeString(!lodash.isEmpty(inputData) ? "?" + queryString.stringify(inputData) : "");
});

class Transformer {
    nodeTypes = [];

    static async init() {
        const response = await axios.get("/configuration/model/node_type/data");
        this.nodeTypes = response?.data?.data;
    }

    static transformFromBd(bdModel) {
        if (!bdModel.nodes) {
            console.error("Invalid Model");
            return [];
        }
        try {
            const elements = [];

            //Para mantener compatibilidad, quitar en el futuro.
            if (!Array.isArray(bdModel.nodes) && bdModel.nodes.list) {
                bdModel.nodes = bdModel.nodes.list;
            }

            for (const node of bdModel?.nodes) {
                const nodeType = lodash.find(this.nodeTypes, (el) => {
                    return el.id === node.type_id || el.code === node.type_id;
                });

                if (!nodeType) {
                    continue;
                }
                elements.push({
                    id: node.id,
                    position: node.position,
                    data: {
                        label: node.custom_name,
                        channel_id: bdModel.id,
                        channel_status: bdModel.status,
                        ...node.data,
                    },
                    type: nodeType.data.react_component_type,
                    sourcePosition: "right",
                    targetPosition: "left",
                });
                if (node.links) {
                    for (const link of node.links) {
                        const existTarget = lodash.find(bdModel?.nodes, { id: link.node_id });
                        if (!existTarget) {
                            continue; //Ignorar los inexistentes
                        }
                        elements.push({
                            source: node.id,
                            sourceHandle: link.handle,
                            target: link.node_id,
                            targetHandle: null,
                            label: "",
                            // "type": 'smoothstep',
                            id: `reactflow__edge-${node.id}${link.handle}-${link.node_id}null`,
                        });
                    }
                }
            }

            return elements;
        } catch (ex) {
            console.error(ex);
            return [];
        }
    }
    static transformToBD(originalChannel, elements) {
        const channel = { ...originalChannel };

        const nodes = [];
        for (const idx in elements) {
            const element = elements[idx];

            if (!element.hasOwnProperty("source")) {
                const connections = lodash.filter(elements, {
                    source: element.id,
                });

                const nodeType = lodash.find(this.nodeTypes, (el) => {
                    return el.id === element.data.type_id || el.code === element.data.type_id;
                });

                //Element
                const node = {
                    id: element.id,
                    type_id: nodeType && nodeType.code,
                    custom_name: element.data.label,
                    links: connections.map((con) => ({
                        node_id: con.target,
                        handle: con.sourceHandle,
                    })),
                    position: element.position,
                    data: lodash.omit(element.data, ["label", "type_id"]),
                };
                if (node.data.handles) {
                    node.data.handles = Transformer.linkHandles(node.data.handles, node.links);
                }
                nodes.push(node);
            }
        }

        channel.nodes = nodes;
        return channel;
    }
    static async fromBDToCamel(channel) {
        const response = await axios.post("/integration_channel/to_camel", {
            channel,
        });

        const camelStr = response?.data?.data;
        return beautify(camelStr);
    }

    static linkHandles = (conditions, links) => {
        for (const condition of conditions) {
            const link = lodash.filter(links, { handle: condition.id });
            condition.to = lodash.map(link, "node_id") || "empty";
        }
        return conditions;
    };
}

export default Transformer;
