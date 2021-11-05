import React, { useState, useRef, useEffect } from "react";
import ReactFlow, { ReactFlowProvider, addEdge, removeElements, Controls, MiniMap, Background } from "react-flow-renderer";

import Sidebar from "./Sidebar";
import SwitchNode from "./custom_nodes/SwitchNode";
import Transformer from "./Transformer";
import usePrevious from "../../../common/usePrevious";

import { v4 as uuid_v4 } from "uuid";

import "./Channel.css";

const nodeTypes = {
    switchNode: SwitchNode,
};

const Channel = ({ channel, onChannelUpdate }) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [elements, setElements] = useState(undefined);
    const [selectedTypeId, changeSelection] = useState(null);
    const [editNodeVisible, setEditNodeVisible] = useState(false);

    const prevElements = usePrevious(elements);
    /**
     * Almacena la instancia actual del RFlow
     * @param {*} _reactFlowInstance
     * @returns
     */
    const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

    /**
     * Carga inicial de los elements en base al canal recibido como prop
     */
    useEffect(() => {
        if (channel) {
            setElements(Transformer.transformFromBd(channel));
        }
    }, []);

    /**
     * Evento que escucha las modificaciones en el flujo de RFlow y lo envia al componente superior para notificar la modificacion.
     *
     * Realiza la transformacion desde RFlow -> BD
     */
    useEffect(() => {
        if (prevElements !== undefined) {
            //Si es undefined y se esta ejecutando es porque se esta estableciendo por primera vez y no es necesario notificar arriba.
            onChannelUpdate(Transformer.transformToBD(channel, elements));
        }
    }, [elements]);

    /**
     * Metodo para crear una conexión entre dos nodos
     * @param {*} params
     */
    const onConnect = (params) => {
        setElements((els) => addEdge({ ...params, label: "Conexión" /*TODO Parametrizar*/ }, els));
    };
    /**
     * Metodo para eliminar un nodo del flujo
     * @param {*} elementsToRemove
     * @returns
     */
    const onElementsRemove = (elementsToRemove) => setElements((els) => removeElements(elementsToRemove, els));

    /**
     * Evento al finalizar el drag de los nodos
     */
    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    /**
     * Genera los identificadores de los handles de un nodo
     * @param {*} data
     */
    const generateHandleIds = (data) => {
        if (data.handles && data.handles.length !== 0) {
            data.handles = data.handles.map((handle, idx) => {
                if (!handle.id) {
                    handle.id = "out" + idx;
                }
                return handle;
            });
        }
    };

    /**
     * Evento desencadenado al actualizar un nodo
     * @param {*} event
     * @param {*} node
     */
    const onNodeUpdate = (event, node) => {
        setEditNodeVisible(false);
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

    /**
     * Evento desencadenado al desplegar un nodo sobre el panel
     * @param {*} event
     */
    const onDrop = (event) => {
        event.preventDefault();

        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
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
            data: { ...extra },
            sourcePosition: "right",
            targetPosition: "left",
        };

        setElements((es) => es.concat(newNode));
    };

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
                            onNodeDoubleClick={(event, node) => {
                                changeSelection(node.id);
                                setEditNodeVisible(true);
                            }}>
                            <Controls />
                            <MiniMap />
                            <Background />
                        </ReactFlow>
                    </div>

                    <Sidebar
                        selectedType={(elements && elements.find && elements.find((e) => e.id === selectedTypeId)) || {}}
                        editNodeVisible={editNodeVisible}
                        onEditCancel={() => setEditNodeVisible(false)}
                        onNodeUpdate={onNodeUpdate}
                    />
                </ReactFlowProvider>
            </div>
        </div>
    );
};

export default Channel;
