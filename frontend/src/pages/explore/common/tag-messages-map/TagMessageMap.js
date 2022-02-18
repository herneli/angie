import { useEffect, useState } from "react";

import lodash from "lodash";
import ReactFlow, { isNode, Controls, ReactFlowProvider, useZoomPanHelper } from "react-flow-renderer";

import dagre from "dagre";
import FloatingEdge from "../../../../components/react-flow/FloatingEdge";

import "./TagMessageMap.css";
import TagNode from "../../../../components/react-flow/custom_nodes/TagNode";
import useEventListener from "../../../../hooks/useEventListener";

import * as api from "../../../../api/configurationApi";
import { Checkbox, Divider, Spin } from "antd";

import T from "i18n-react";

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

/**
 * Componente que se encarga de hacer un FitView del ReactFlow al ser montado
 * @param {*} param0
 * @returns
 */
const FitView = ({ done }) => {
    const { fitView } = useZoomPanHelper();
    useEffect(() => {
        fitView();
        done();
    }, []);
    return <></>;
};

const TagMessageMap = ({ record, selection, setSelection, onCheckedChange, loading }) => {
    const [elements, setElements] = useState([]);
    const [tags, setTags] = useState([]);
    const [checkedNodes, setCheckedNodes] = useState(null);

    const [indeterminate, setIndeterminate] = useState(true);
    const [checkAllNodes, setCheckAllNodes] = useState(false);

    const [availableChecks, setAvailableChecks] = useState(null);

    const [forceFitView, setForceFitView] = useState(false);

    useEffect(() => {
        loadRecord(record);
    }, [record]);


    const loadRecord = async (record) => {
        if (!lodash.isEmpty(record)) {
            let available = availableChecks;
            let tagMaster = tags;
            if (record && record.nodes && availableChecks == null) {
                const data = await getCurrentOptions(record);
                available = data.available;
                tagMaster = data.tags;
            }
            let checked = checkedNodes;
            if (record && record.nodes && checkedNodes == null) {
                checked = defaultSelected(record, available);
                setCheckedNodes(checked);
            }

            createElements(record, tagMaster, checked);
            refitView();
        }
    };
    /**
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadTags = async () => {
        try {
            const tags = await api.getModelDataList("tag");
            setTags(tags);
            return tags;
        } catch (ex) {
            console.error(ex);
        }
    };

    const defaultSelected = ({ nodes }, available) => {
        const selected = lodash.keys(nodes);
        setCheckAllNodes(selected.length >= available.length);
        console.log(selected.length);
        console.log(available.length);
        setIndeterminate(!!selected.length && selected.length < available.length);
        return selected;
    };

    useEventListener("resize", () => {
        refitView();
    });

    const refitView = () => {
        setTimeout(() => {
            setForceFitView(true);
        }, 100);
    };

    /**
     * Convertir los calculos realizados en componentes para pintar en el ReactFlow
     *
     * @param {*} data
     */
    const createElements = async (data, tags, checked) => {
        if (data) {
            const { connections, nodes, counters } = data;

            //Crear los nodos
            const elems = [];
            for (const tag of tags) {
                const el = nodes[tag.code];
                if (checked?.indexOf(tag.code) === -1) {
                    continue;
                }

                const srcCount = lodash.find(counters, { code: tag.code, type: "source" });
                const tgtCount = lodash.find(counters, { code: tag.code, type: "target" });
                elems.push({
                    id: tag.code,
                    type: "TagNode",
                    // selectable: false,
                    data: {
                        label: tag.name,
                        tagId: tag.id,
                        healthcheck: tag.healthcheck,
                        error_sent: srcCount && srcCount.error,
                        success_sent: srcCount && srcCount.sent,
                        error_rec: tgtCount && tgtCount.error,
                        success_rec: tgtCount && tgtCount.sent,
                        onElementClick: (type) => {
                            switch (type) {
                                case "error_sent":
                                    if (el) setSelection(`datatags:${tag.code}- status:error`);
                                    break;
                                case "error_rec":
                                    if (el) setSelection(`datatags:-${tag.code} status:error`);
                                    break;
                                case "success_sent":
                                    if (el) setSelection(`datatags:${tag.code}- status:sent`);
                                    break;
                                case "success_rec":
                                    if (el) setSelection(`datatags:-${tag.code} status:sent`);
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
                setSelection();
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

    const getCurrentOptions = async (data) => {
        const tagsMaster = await loadTags();

        let currentTags = lodash.filter(tagsMaster, (tag) => (data.nodes[tag.code] ? true : false));
        const available = lodash.map(currentTags, (tag) => ({ label: tag.name, value: tag.code }));
        setAvailableChecks(available);
        return { available, tags: tagsMaster };
    };
    return (
        <span className="tagMap">
            <ReactFlowProvider>
                <Spin spinning={loading} />
                {tags && (
                    <div>
                        <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAllNodes}>
                            {T.translate("common.all")}
                        </Checkbox>
                        <Divider type="vertical" />
                        <Checkbox.Group options={availableChecks || []} value={checkedNodes} onChange={onChange} />
                    </div>
                )}
                {forceFitView && <FitView done={setForceFitView} />}
                <ReactFlow
                    edgeTypes={edgeTypes}
                    nodeTypes={{
                        TagNode: TagNode,
                    }}
                    // onSelectionChange={onElementSelection}
                    // zoomOnScroll={false}
                    panOnScroll={false}
                    onNodeDragStart={(e) => e.stopPropagation()}
                    // paneMoveable={false}
                    selectNodesOnDrag={false}
                    // nodesDraggable={false}
                    nodesConnectable={false}
                    elements={elements}
                    zoomOnDoubleClick={false}
                    snapToGrid={true}>
                    <Controls showInteractive={false} />
                </ReactFlow>
            </ReactFlowProvider>
        </span>
    );
};

export default TagMessageMap;
