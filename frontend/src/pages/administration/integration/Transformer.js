import lodash from "lodash";
import Handlebars from "handlebars";

import axios from "axios";

import * as queryString from "query-string";
import * as xmlformat from "xml-formatter";

Handlebars.registerHelper("safe", function (inputData) {
    return new Handlebars.SafeString(inputData);
});
Handlebars.registerHelper("querystring", function (inputData) {
    return new Handlebars.SafeString(!lodash.isEmpty(inputData) ? "?" + queryString.stringify(inputData) : "");
});

class Transformer {
    nodeTypes = [];

    static async init() {
        const response = await axios.get("/node_type");
        this.nodeTypes = response?.data?.data;
    }

    static transformFromBd(bdModel, onNodeUpdate) {
        if (!bdModel.nodes) {
            console.error("Invalid Model");
            return [];
        }
        try {
            const elements = [];

            for (const node of bdModel?.nodes?.list) {
                const nodeType = lodash.find(this.nodeTypes, {
                    id: node.type_id,
                });

                if (!nodeType) {
                    continue;
                }
                elements.push({
                    id: node.id,
                    position: node.position,
                    data: {
                        ...node.data,
                        onNodeUpdate: onNodeUpdate,
                        label: node.custom_name,
                        type_id: node.type_id,
                    },
                    type: nodeType.react_component_type,
                    sourcePosition: "right",
                    targetPosition: "left",
                });
                if (node.links) {
                    for (const link of node.links) {
                        elements.push({
                            source: node.id,
                            sourceHandle: link.handle,
                            target: link.node_id,
                            targetHandle: null,
                            label: "Conexión",
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

                const nodeType = lodash.find(this.nodeTypes, {
                    id: element.data.type_id,
                });

                //Element
                const node = {
                    id: element.id,
                    type_id: nodeType && nodeType.id,
                    custom_name: element.data.label,
                    links: connections.map((con) => ({
                        node_id: con.target,
                        handle: con.sourceHandle,
                    })),
                    position: element.position,
                    data: lodash.omit(element.data, ["label", "type_id", "onNodeUpdate"]),
                };
                if (node.data.handles) {
                    node.data.handles = Transformer.linkHandles(node.data.handles, node.links);
                }
                nodes.push(node);
            }
        }

        channel.nodes = { list: nodes };
        return channel;
    }
    static async fromBDToCamel(channel) {
        const response = await axios.post("/integration_channel/to_camel", {
            channel,
        });

        const camelStr = response?.data?.data;
        console.log(camelStr);
        return xmlformat(`<routes  xmlns=\"http://camel.apache.org/schema/spring\">${camelStr}</routes>`);
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
