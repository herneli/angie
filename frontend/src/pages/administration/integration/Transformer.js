import lodash from 'lodash';
import Handlebars from 'handlebars';

import node_types from './constants/node_types';
import camel_components from './constants/camel_components';
import * as queryString from 'query-string';
import * as xmlformat from 'xml-formatter'

Handlebars.registerHelper('safe', function (inputData) {
    return new Handlebars.SafeString(inputData);
});
Handlebars.registerHelper('querystring', function (inputData) {
    return new Handlebars.SafeString(!lodash.isEmpty(inputData) ? "?" + (queryString.stringify(inputData)) : "");
});

function formatXml(xml) {
    return xmlformat(xml);
}

// Vincula los diferentes handles de un elemento con los identificadores de los destinos
const linkHandles = (conditions, links) => {
    for (const condition of conditions) {
        const link = lodash.filter(links, { handle: condition.id });
        condition.to = lodash.map(link, 'node_id') || "empty";
    }
    return conditions;
}
//Convierte un objeto BD a un objeto RFlow
const transformFromBd = (bdModel, onNodeUpdate) => {
    if (!bdModel.nodes) {
        console.error("Invalid Model");
        return [];
    }
    try {
        const elements = [];

        for (const node of bdModel.nodes) {
            const nodeType = lodash.find(node_types, { id: node.type_id });

            elements.push({
                id: node.id,
                position: node.position,
                data: {
                    ...node.data,
                    onNodeUpdate: onNodeUpdate,
                    label: node.custom_name,
                    type_id: node.type_id
                },
                type: nodeType.react_component_type,
                "sourcePosition": "right",
                "targetPosition": "left"
            })
            if (node.links) {
                for (const link of node.links) {
                    elements.push({
                        "source": node.id,
                        "sourceHandle": link.handle,
                        "target": link.node_id,
                        "targetHandle": null,
                        "label": "Conexión",
                        // "type": 'smoothstep',
                        "id": `reactflow__edge-${node.id}${link.handle}-${link.node_id}null`
                    })
                }
            }
        }

        return elements;

    } catch (ex) {
        console.error(ex);
        return { "error": "Invalid Model" }
    }
}

//Convierte una ruta Rflow a objetos BD
const transformToBD = (originalChannel, elements) => {
    const channel = { ...originalChannel }

    const nodes = [];
    for (const idx in elements) {
        const element = elements[idx];

        if (!element.hasOwnProperty("source")) {

            const connections = lodash.filter(elements, { source: element.id });

            const nodeType = lodash.find(node_types, { id: element.data.type_id });

            //Element
            const node = {
                "id": element.id,
                "type_id": nodeType && nodeType.id,
                "custom_name": element.data.label,
                "links": connections.map((con) => ({
                    node_id: con.target,
                    handle: con.sourceHandle
                })),
                "position": element.position,
                "data": lodash.omit(element.data, ["label", "type_id", 'onNodeUpdate'])
            };
            if (node.data.handles) {
                node.data.handles = linkHandles(node.data.handles, node.links);
            }
            nodes.push(node);
        }
    }


    channel.nodes = nodes;
    return channel;
}


//Convierte un objeto DB a un conjunto de rutas camel
const fromBDToCamel = (channel) => {
    let nodes = lodash.cloneDeep(channel.nodes);

    let camelStr = "";
    for (const idx in nodes) {
        const element = nodes[idx];


        let type = lodash.find(node_types, { id: element.type_id });
        let camelComponent = lodash.find(camel_components, { id: type.camel_component_id });

        if (camelComponent.xml_template) {
            const template = Handlebars.compile(camelComponent.xml_template);

            camelStr += template({
                source: element.id,
                target: (element.links && element.links.length !== 0) ? lodash.map(element.links, 'node_id') : ["empty"],
                ...element.data
            });
        }

    }


    return formatXml(`<routes  xmlns=\"http://camel.apache.org/schema/spring\">${camelStr}</routes>`);
}


export { transformFromBd, transformToBD, fromBDToCamel };