import React, { useState, useRef, useEffect } from "react";
import ReactFlow, { ReactFlowProvider, Controls, MiniMap, Background } from "react-flow-renderer";

import Sidebar from "./Sidebar";
import MultiTargetNode from "./custom_nodes/MultiTargetNode";
import ButtonNode from "./custom_nodes/ButtonNode";
import Transformer from "./Transformer";

import { v4 as uuid_v4 } from "uuid";

import "./Channel.css";
import NodeEditModal from "./NodeEditModal";

import lodash, { filter } from "lodash";

const customNodes = {
    MultiTargetNode: MultiTargetNode,
    ButtonNode: ButtonNode,
};

const Channel = ({ channel, onChannelUpdate, nodeTypes }) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [elements, setElements] = useState(undefined);
    const [selectedType, changeSelection] = useState(null);
    const [editNodeVisible, setEditNodeVisible] = useState(false);

    /**
     * Almacena la instancia actual del RFlow
     * @param {*} _reactFlowInstance
     * @returns
     */
    const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

    /**
     * Carga inicial de los elements en base al canal recibido como prop.
     *
     * Todas las modificaciones que se realicen sobre el flujo y los nodos se notifican al componente superior esperando
     * recibir el nuevo canal en formato BD para convertirlo en "elements" y actualizarlo en el react flow
     *
     */
    useEffect(() => {
        if (channel) {
            console.log("transform!");
            setElements(Transformer.transformFromBd(channel));
        }
        console.log(channel);
    }, [channel]);

    /**
     * Metodo para crear una conexión entre dos nodos
     * @param {*} params
     */
    const onConnect = (params) => {
        let newChannel = lodash.cloneDeep(channel);
        let modifiedNode = lodash.find(newChannel.nodes, { id: params.source });

        if (!modifiedNode.links) {
            modifiedNode.links = [];
        }
        modifiedNode.links = [
            ...modifiedNode.links,
            {
                node_id: params.target,
                handle: params.sourceHandle,
            },
        ];
        onNodeEditEnd(modifiedNode.id, modifiedNode);
    };

    /**
     * Recorre los nodos y recalcula los links entre ellos eliminando aquellos cuya referencia se haya perdido.
     *
     * @param {*} nodes
     * @returns
     */
    const recalculateLinks = (nodes, linksToRemove) => {
        return nodes.map((node) => {
            //Recalcular los enlaces entre nodos
            node.links = lodash.filter(node.links, (link) => {
                //Si hay algun link a eliminar se filtra para el origen y el destino evitando asi que este presente.
                if (linksToRemove && lodash.find(linksToRemove, { source: node.id, target: link.node_id })) {
                    return false;
                }
                //Aun asi se revisa si existe algun link con un elemento "missing"
                const existTarget = lodash.find(nodes, { id: link.node_id });
                return existTarget != null;
            });
            return node;
        });
    };

    /**
     * Metodo para eliminar un nodo
     * @param {*} elementsToRemove
     * @returns
     */
    const onElementsRemove = (elementsToRemove) => {
        let idsToRemove = lodash.map(elementsToRemove, "id"); //Obtener solo aquellos con id

        let linksToRemove = lodash.filter(elementsToRemove, (el) => el.source && el.target); //Los links tienen un source y un target con lo que se obtienen para revisar su eliminacion.

        let newChannel = lodash.cloneDeep(channel);
        let newNodes = newChannel.nodes.filter((node) => idsToRemove.indexOf(node.id) === -1); //Quitar el que estamos eliminando
        newChannel.nodes = recalculateLinks(newNodes, linksToRemove);

        onChannelUpdate(newChannel);
    };

    /**
     * Evento al finalizar el drag de los nodos
     */
    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    /**
     * Genera los identificadores de los handles de un nodo.
     *
     * Ejemplo:  el switch que dispone de multiples handles o el loop que tiene dos pero son dinamicos
     * @param {*} data
     */
    const generateHandleIds = (handles) => {
        if (handles && handles.length !== 0) {
            return handles.map((handle, idx) => {
                if (!handle.id) {
                    handle.id = "out" + idx;
                }
                return handle;
            });
        }
    };

    /**
     * Metodo ejecutado al finalizar la edición de un nodo.
     * @param {*} id
     * @param {*} newData
     */
    const onNodeEditEnd = (id, newData) => {
        setEditNodeVisible(false);

        let newChannel = lodash.cloneDeep(channel);

        let newNodes = newChannel.nodes.map((node) => {
            if (node.id === id) {
                node = { ...node, ...newData };
                node.data.handles = generateHandleIds(node.data.handles);
            }
            return node;
        });
        newChannel.nodes = newNodes;
        onChannelUpdate(newChannel);
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

        let newChannel = lodash.cloneDeep(channel);
        newChannel.nodes.push({
            id: uuid_v4(),
            type_id: type,
            custom_name: extra.label,
            links: [],
            position: position,
            data: lodash.omit(extra, ["label"]),
        });
        onChannelUpdate(newChannel);
    };

    /**
     * Metodo encargado de comenzar la edición de un nodo
     */
    const startEditing = (nodeId) => {
        let selection = lodash.find(channel.nodes, { id: nodeId });

        changeSelection(selection);
        setEditNodeVisible(true);
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
                            nodeTypes={customNodes}
                            deleteKeyCode={46}
                            onDragOver={onDragOver}
                            onNodeDragStop={(event, node) => {
                                onNodeEditEnd(node.id, {
                                    position: node.position,
                                    data: node.data,
                                });
                            }}
                            onNodeDoubleClick={(event, node) => {
                                startEditing(node.id);
                            }}>
                            <Controls />
                            <MiniMap />
                            <Background />
                        </ReactFlow>
                    </div>

                    <Sidebar nodeTypes={nodeTypes} />

                    <NodeEditModal
                        selectedType={selectedType}
                        nodeTypes={nodeTypes}
                        editNodeVisible={editNodeVisible}
                        onEditCancel={() => setEditNodeVisible(false)}
                        onNodeEditEnd={onNodeEditEnd}
                    />
                </ReactFlowProvider>
            </div>
        </div>
    );
};

export default Channel;
