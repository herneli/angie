import React, { useState, useRef, useEffect } from "react";
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    removeElements,
    Controls,
    MiniMap,
    Background,
} from "react-flow-renderer";

import CodeMirrorExt from "../../../components/CodeMirrorExt";
import Sidebar from "./Sidebar";
import SwitchNode from "./custom_nodes/SwitchNode";
import {
    fromBDToCamel,
    transformFromBd,
    transformToBD,
} from "./Transformer";

import { v4 as uuid_v4 } from "uuid";

import "./Channel.css";

const nodeTypes = {
    switchNode: SwitchNode,
};


const Channel = ({ channel }) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [elements, setElements] = useState([]);
    const [bdModel, setBdModel] = useState({});
    const [selectedTypeId, changeSelection] = useState(null);

    const onConnect = (params) => {
        setElements((els) =>
            addEdge({ ...params, label: "Conexión" /*TODO Parametrizar*/ }, els)
        );
    };
    const onElementsRemove = (elementsToRemove) =>
        setElements((els) => removeElements(elementsToRemove, els));

    const onLoad = (_reactFlowInstance) =>
        setReactFlowInstance(_reactFlowInstance);

    // Evento al finalizar el drag de los nodos
    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    //Genera los identificadores de los handles de un nodo
    const generateHandleIds = (data) => {
        if (data.handles && data.handles.length !== 0) {
            data.handles = data.handles.map((handle, idx) => {
                if (!handle.id) {
                    handle.id = "out" + idx; //TODO uuid?
                }
                return handle;
            });
        }
    };

    //Evento desencadenado al actualizar un nodo
    const onNodeUpdate = (event, node) => {
        setElements((els) =>
            els.map((e) => {
                if (e.id === node.id) {
                    e.position = node.position || e.position;
                    e.data = node.data || e.data;
                    if (e.data.handles) {
                        generateHandleIds(e.data);
                    }
                }
                return e;
            })
        );
    };

    //Evento desencadenado al desplegar un nodo sobre el panel
    const onDrop = (event) => {
        event.preventDefault();

        const reactFlowBounds =
            reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData("application/reactflow");
        let extra = event.dataTransfer.getData("application/reactflow/extra");
        if (extra && extra !== "undefined") extra = JSON.parse(extra);

        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });
        const newNode = {
            id: uuid_v4(),
            type,
            position,
            data: { ...extra, onNodeUpdate: onNodeUpdate },
            sourcePosition: "right",
            targetPosition: "left",
        };

        setElements((es) => es.concat(newNode));
    };


    useEffect(() => {
        setBdModel(transformToBD(channel, elements));
    }, [elements]);


    useEffect(() => {
        if (channel) {
            setElements(transformFromBd(channel, onNodeUpdate));
        }
    }, [channel]);

    return (
        <div>
            <div className="dndflow">
                <ReactFlowProvider>
                    <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                        <ReactFlow
                            elements={elements}
                            onConnect={onConnect}
                            onElementsRemove={onElementsRemove}
                            onLoad={onLoad}
                            onDrop={onDrop}
                            nodeTypes={nodeTypes}
                            deleteKeyCode={46}
                            onDragOver={onDragOver}
                            onNodeDragStop={onNodeUpdate}
                            onNodeDoubleClick={(event, node) =>
                                changeSelection(node.id)
                            }
                        >
                            <Controls />
                            <MiniMap />
                            <Background />
                        </ReactFlow>
                    </div>

                    <Sidebar
                        selectedType={(elements.find && elements.find((e) => e.id === selectedTypeId)) || {}}
                        onNodeUpdate={onNodeUpdate}
                    />
                </ReactFlowProvider>
            </div>
            <br />
            <div>
                <div
                    style={{
                        float: "left",
                        width: "31vw",
                        margin: 10,
                    }}
                >
                    Database &nbsp;&nbsp;&nbsp;

                    <CodeMirrorExt
                        value={JSON.stringify(bdModel, null, 2)}
                        onChange={(val) => setBdModel(JSON.parse(val))}
                        name="database.code"
                        options={{
                            lineNumbers: true,
                            mode: "javascript",
                            matchBrackets: true,
                        }}
                    />
                </div>
                <div
                    style={{
                        float: "left",
                        width: "31vw",
                        margin: 10,
                    }}
                >
                    Camel &nbsp;&nbsp;&nbsp;
                    <CodeMirrorExt
                        value={fromBDToCamel(transformToBD(channel, elements))}
                        name="camel.code"
                        options={{
                            lineNumbers: true,
                            mode: "xml",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Channel;
