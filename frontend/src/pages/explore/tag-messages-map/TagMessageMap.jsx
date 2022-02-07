import { useEffect, useState } from "react";

import lodash from "lodash";
import ReactFlow, { isNode, Controls } from "react-flow-renderer";

import dagre from "dagre";
import FloatingEdge from "../../../components/react-flow/FloatingEdge";

import "./TagMessageMap.css";
import TagNode from "../../../components/react-flow/custom_nodes/TagNode";
import useEventListener from "../../../common/useEventListener";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;
const getLayoutedElements = (elements) => {
    dagreGraph.setGraph({ rankdir: "TB", acyclicer: "greedy", nodesep: 100, ranksep: 100 });

    elements.forEach((el) => {
        if (isNode(el)) {
            dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
        } else {
            dagreGraph.setEdge(el.source, el.target);
        }
    });

    dagre.layout(dagreGraph);

    return elements.map((el) => {
        if (isNode(el)) {
            const nodeWithPosition = dagreGraph.node(el.id);
            el.position = {
                x: nodeWithPosition.x,
                y: nodeWithPosition.y,
            };
        }

        return el;
    });
};

const TagMessageMap = ({ record, selection, setSelection }) => {
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const [currentNodes, setCurrentNodes] = useState({});
    const [elements, setElements] = useState([]);

    useEffect(() => {
        createNodes(record);
    }, [record]);

    useEffect(() => {
        createElements(record);
    }, [currentNodes, selection]);

    useEffect(() => {
        refitView();
    }, [record]);

    /**
     * Almacena la instancia actual del RFlow
     * @param {*} _reactFlowInstance
     * @returns
     */
    const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

    const addNode = (nodes, key, as) => {
        if (!key) return;
        if (!nodes[key]) {
            nodes[key] = {};
        }
        nodes[key][as] = true;
    };

    const addNodeMessage = (nodes, key, type, id) => {
        if (!key) return;
        if (!nodes[key]) {
            nodes[key] = {};
        }
        if (!nodes[key][type]) {
            nodes[key][type] = [];
        }
        nodes[key][type].push(id);
    };

    const addConnection = (connections, key, data) => {
        if (!connections[key]) {
            connections[key] = {
                id: key,
                animated: true,
                type: "floating",
                arrowHeadType: "arrowclosed",
                style: { stroke: "green" },
            };
        }
        connections[key] = { ...connections[key], ...data };
    };

    useEventListener("resize", () => {
        refitView();
    });

    const refitView = () => {
        setTimeout(() => {
            if (reactFlowInstance) {
                reactFlowInstance.fitView({ padding: 0.5 });
            }
        }, 100);
    };

    /**
     * Calcular los nodos disponibles
     *
     * @param {*} param0
     */
    const createNodes = (data) => {
        if (!data) return;

        const { tags, raw_messages } = data;
        const groupedMsg = lodash.groupBy(tags, "_source.messageId");
        const nodes = {};
        //Recorrer los mensajes agrupados por identificador (diferentes posibles tags)
        for (const el in groupedMsg) {
            const tagList = groupedMsg[el];

            //Obtener los datos principales del mensaje
            const msg_data = lodash.find(raw_messages, { _id: el });
            const status = msg_data._source.status;

            //Ordenar por fecha para mirar las direcciones
            const sorted = lodash.sortBy(tagList, "date");
            for (let idx = 0; idx < sorted.length; idx++) {
                let prevMsg = sorted[idx];
                let msg = sorted[idx + 1];
                const sourceTag = prevMsg?._source.tag;
                const targetTag = msg?._source.tag;
                //El anterior se obtiene como source y el actual como target
                addNode(nodes, sourceTag, "source");
                addNode(nodes, targetTag, "target");

                //Si no hay target es porque es el ultimo, el destino final.
                //En caso de que el listado tenga un solo elemento se cuenta tambien (errores, y flujos de solo 1 tag)
                if (targetTag || sorted.length === 1) addNodeMessage(nodes, sourceTag, status, el); //Contar los "source"
            }
        }

        setCurrentNodes(nodes);
    };

    /**
     * Crear las conexiones entre nodos
     *
     * @param {*} param0
     * @returns
     */
    const createConnections = ({ tags, raw_messages }) => {
        const groupedMsg = lodash.groupBy(tags, "_source.messageId");
        const connections = {};
        //Recorrer los mensajes agrupados por identificador (diferentes posibles tags)
        for (const el in groupedMsg) {
            const tagList = groupedMsg[el];

            //Obtener los datos principales del mensaje
            const msg_data = lodash.find(raw_messages, { _id: el });
            const status = msg_data._source.status;

            //Ordenar por fecha para mirar las direcciones
            const sorted = lodash.sortBy(tagList, "date");
            for (let idx = 0; idx < sorted.length; idx++) {
                let prevMsg = sorted[idx];
                let msg = sorted[idx + 1];
                const sourceTag = prevMsg?._source.tag;
                const targetTag = msg?._source.tag;

                const connection = {
                    source: sourceTag,
                    target: targetTag,
                };
                if (status === "error") {
                    connection.style = { stroke: "red" };
                } else {
                    connection.style = { stroke: "green" };
                }

                const id = sourceTag + "-" + targetTag;
                const selected = selection.indexOf(msg_data._id) !== -1;
                if (selected) {
                }
                //Solo añade la conexion si hay nodos que conectar o si se esta intentando visualizar uno/varios mensajes concretos
                if (prevMsg && msg && (lodash.isEmpty(selection) || selected)) {
                    addConnection(connections, id, connection);
                }
            }
        }

        return { connections };
    };

    /**
     * Convertir los calculos realizados en componentes para pintar en el ReactFlow
     *
     * @param {*} data
     */
    const createElements = (data) => {
        if (data) {
            const { connections } = createConnections(data);

            //Crear los nodos
            const elems = lodash.map(currentNodes, (el, key) => {
                return {
                    id: key,
                    type: "TagNode",
                    data: {
                        label: key,
                        error_count: lodash.uniq(el.error).length,
                        success_count: lodash.uniq(el.sent).length,
                        onElementClick: (type) => {
                            switch (type) {
                                case "error":
                                    if (el.error) setSelection(el.error);
                                    break;
                                case "success":
                                    if (el.sent) setSelection(el.sent);
                                    break;
                                default:
                            }
                        },
                    },
                    className: el.selected ? "selected" : null,
                    position: { x: 0, y: 0 },
                };
            });

            setElements(getLayoutedElements([...elems, ...lodash.values(connections)]));
        }
    };

    const onElementSelection = (elements) => {
        if (record) {
            const groupedTags = lodash.groupBy(record.tags, "_source.tag");

            if (!lodash.isEmpty(elements)) {
                const id = elements[0].id;
                const messages = lodash.map(groupedTags[id], "_source.messageId");
                setSelection(messages);
            } else {
                setSelection([]);
            }
        }
    };

    const edgeTypes = {
        floating: FloatingEdge,
    };

    return (
        <span className="tagMap">
            <ReactFlow
                onLoad={onLoad}
                edgeTypes={edgeTypes}
                nodeTypes={{
                    TagNode: TagNode,
                }}
                onSelectionChange={onElementSelection}
                zoomOnScroll={false}
                panOnScroll={false}
                paneMoveable={false}
                nodesDraggable={false}
                nodesConnectable={false}
                elements={elements}
                zoomOnDoubleClick={false}
                snapToGrid={true}>
                <Controls showInteractive={false} />
            </ReactFlow>
        </span>
    );
};

export default TagMessageMap;
