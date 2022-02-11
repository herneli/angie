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

const nodeWidth = 230;
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

const TagMessageMap = ({ record, selection, setSelection, onCheckedChange }) => {
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const [elements, setElements] = useState([]);
    const [tags, setTags] = useState([]);
    const [checkedNodes, setCheckedNodes] = useState(null);

    const [indeterminate, setIndeterminate] = useState(true);
    const [checkAllNodes, setCheckAllNodes] = useState(false);

    useEffect(() => {
        loadTags();
    }, []);

    useEffect(() => {
        if (record && record.nodes && checkedNodes == null) {
            setCheckedNodes(defaultSelected(record));
        }
        createElements(record);
    }, [record]);

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

    const defaultSelected = ({ nodes }) => {
        const selected = lodash.keys(nodes);
        setCheckAllNodes(selected.length >= tags.length);
        setIndeterminate(!!selected.length && selected.length < tags.length);
        return selected;
    };

    /**
     * Almacena la instancia actual del RFlow
     * @param {*} _reactFlowInstance
     * @returns
     */
    const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

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
     * Convertir los calculos realizados en componentes para pintar en el ReactFlow
     *
     * @param {*} data
     */
    const createElements = async (data) => {
        if (data) {
            const { connections, nodes } = data;

            //Crear los nodos
            const elems = [];
            for (const tag of tags) {
                const el = nodes[tag.code];
                if (checkedNodes?.indexOf(tag.code) === -1) {
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
                                // case "error_sent":
                                //TODO selection!
                                //     if (el) setSelection(lodash.uniq(el.error_sent));
                                //     break;
                                // case "error_rec":
                                //     if (el) setSelection(lodash.uniq(el.error_rec));
                                //     break;
                                // case "success_sent":
                                //     if (el) setSelection(lodash.uniq(el.sent_sent));
                                //     break;
                                // case "success_rec":
                                //     if (el) setSelection(lodash.uniq(el.sent_rec));
                                //     break;
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
        onCheckedChange(list);
    };

    const onCheckAllChange = (e) => {
        const list = e.target.checked ? lodash.map(tags, "code") : [];
        setCheckedNodes(list);
        setIndeterminate(false);
        setCheckAllNodes(e.target.checked);
        onCheckedChange(list);
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
