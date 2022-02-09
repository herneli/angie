import { useEffect, useState } from "react";

import lodash from "lodash";
import ReactFlow, { isNode, Controls } from "react-flow-renderer";

import dagre from "dagre";
import FloatingEdge from "../../../components/react-flow/FloatingEdge";

import "./TagMessageMap.css";
import TagNode from "../../../components/react-flow/custom_nodes/TagNode";
import useEventListener from "../../../common/useEventListener";

import * as api from "../../../api/configurationApi";
import { Checkbox, Divider } from "antd";

import T from "i18n-react";
import axios from "axios";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 110;
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
    const [tags, setTags] = useState([]);

    const [checkedNodes, setCheckedNodes] = useState([]);
    const [indeterminate, setIndeterminate] = useState(true);
    const [checkAllNodes, setCheckAllNodes] = useState(false);

    useEffect(() => {
        loadTags();
    }, []);

    useEffect(() => {
        if (record && record.tags) {
            setCheckedNodes(defaultSelected(record));
        }
    }, [tags, record]);

    // useEffect(() => {
    //     createNodes(record);
    // }, [tags, record, checkedNodes]);

    useEffect(() => {
        createElements(record);
    }, [selection, checkedNodes]);

    useEffect(() => {
        refitView();
    }, [record]);

    /**
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadTags = async () => {
        try {
            const tags = await api.getModelDataList("tag");
            setTags(tags);
        } catch (ex) {
            console.error(ex);
        }
    };

    const defaultSelected = (record) => lodash.uniq(lodash.map(record.tags, "tag"));

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
        if (checkedNodes.indexOf(key) !== -1) {
            nodes[key][type].push(id);
        }
    };

    const addConnection = (connections, key, data) => {
        if (!connections[key]) {
            connections[key] = {
                id: key,
                animated: true,
                type: "floating",
                arrowHeadType: "arrow",
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
                reactFlowInstance.fitView();
            }
        }, 20);
    };

    /**
     * Crear las conexiones entre nodos
     *
     * @param {*} param0
     * @returns
     */
    const createConnections = ({ tags }) => {
        const tags_filtered = lodash.filter(tags, ({ tag }) => checkedNodes.indexOf(tag) !== -1);

        const groupedMsg = lodash.groupBy(tags_filtered, "message_id");
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
                const sourceTag = prevMsg?.tag;
                const targetTag = msg?.tag;
                //El anterior se obtiene como source y el actual como target
                addNode(nodes, sourceTag, "source");
                addNode(nodes, targetTag, "target");

                //Si no hay target es porque es el ultimo, el destino final.
                //En caso de que el listado tenga un solo elemento se cuenta tambien (errores, y flujos de solo 1 tag)
                addNodeMessage(nodes, sourceTag, msg?.status + "_sent", el); //Contar los "source"
                addNodeMessage(nodes, targetTag, msg?.status + "_rec", el); //Contar los "target"

                const connection = {
                    source: sourceTag,
                    target: targetTag,
                };
                if (msg?.status === "error") {
                    connection.style = { stroke: "red" };
                    connection.arrowHeadType = "arrowclosed";
                } else {
                    connection.style = { stroke: "green" };
                }

                const id = sourceTag + "-" + targetTag;
                const selected = selection.indexOf(msg?.message_id) !== -1;
                if (selected) {
                }
                //Solo añade la conexion si hay nodos que conectar o si se esta intentando visualizar uno/varios mensajes concretos
                if (prevMsg && msg && (lodash.isEmpty(selection) || selected)) {
                    addConnection(connections, id, connection);
                }
            }
        }

        return { connections, nodes };
    };


    /**
     * Convertir los calculos realizados en componentes para pintar en el ReactFlow
     *
     * @param {*} data
     */
    const createElements = async (data) => {
        if (data) {
            const { connections, nodes } = createConnections(data);

            //Crear los nodos
            const elems = [];
            for (const tag of tags) {
                const el = nodes[tag.code];
                if (checkedNodes.indexOf(tag.code) === -1) {
                    continue;
                }

                
                elems.push({
                    id: tag.code,
                    type: "TagNode",
                    // selectable: false,
                    data: {
                        label: tag.name,
                        tagId: tag.id,
                        healthcheck: tag.healthcheck,
                        error_sent: el && lodash.uniq(el.error_sent).length,
                        success_sent: el && lodash.uniq(el.sent_sent).length,
                        error_rec: el && lodash.uniq(el.error_rec).length,
                        success_rec: el && lodash.uniq(el.sent_rec).length,
                        onElementClick: (type) => {
                            switch (type) {
                                case "error_sent":
                                    if (el) setSelection(lodash.uniq(el.error_sent));
                                    break;
                                case "error_rec":
                                    if (el) setSelection(lodash.uniq(el.error_rec));
                                    break;
                                case "success_sent":
                                    if (el) setSelection(lodash.uniq(el.sent_sent));
                                    break;
                                case "success_rec":
                                    if (el) setSelection(lodash.uniq(el.sent_rec));
                                    break;
                                // case "all":
                                //     let sel = [];
                                //     if (el.error_sent) sel = [...sel, ...lodash.uniq(el.error_sent)];
                                //     if (el.sent_sent) sel = [...sel, ...lodash.uniq(el.sent_sent)];
                                //     if (el.error_rec) sel = [...sel, ...lodash.uniq(el.error_rec)];
                                //     if (el.sent_rec) sel = [...sel, ...lodash.uniq(el.sent_rec)];

                                //     setSelection(sel);
                                //     break;
                                default:
                            }
                        },
                    },
                    className: el && el.selected ? "selected" : null,
                    position: { x: 0, y: 0 },
                });
            }

            setElements(getLayoutedElements([...lodash.compact(elems), ...lodash.values(connections)]));
        }
    };

    const onElementSelection = (elements) => {
        if (record) {
            if (!lodash.isEmpty(elements)) {
                // elements[0].data.onElementClick("all"); //Utilizar el metodo definido para forzar la seleccion
            } else {
                setSelection([]);
            }
        }
    };

    const edgeTypes = {
        floating: FloatingEdge,
    };
    const onChange = (list) => {
        setCheckedNodes(list);
        setIndeterminate(!!list.length && list.length < tags.length);
        setCheckAllNodes(list.length === tags.length);
    };

    const onCheckAllChange = (e) => {
        setCheckedNodes(e.target.checked ? lodash.map(tags, "code") : []);
        setIndeterminate(false);
        setCheckAllNodes(e.target.checked);
    };
    return (
        <span className="tagMap">
            {tags && (
                <div>
                    <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAllNodes}>
                        {T.translate("common.all")}
                    </Checkbox>
                    <Divider type="vertical" />
                    <Checkbox.Group
                        options={lodash.map(tags, (tag) => ({ label: tag.name, value: tag.code }))}
                        value={checkedNodes}
                        onChange={onChange}
                    />
                </div>
            )}
            <ReactFlow
                onLoad={onLoad}
                edgeTypes={edgeTypes}
                nodeTypes={{
                    TagNode: TagNode,
                }}
                onSelectionChange={onElementSelection}
                // zoomOnScroll={false}
                panOnScroll={false}
                // paneMoveable={false}
                selectNodesOnDrag={false}
                // nodesDraggable={false}
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
