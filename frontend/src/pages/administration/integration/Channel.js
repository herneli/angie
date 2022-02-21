import React, { useState, useRef, useEffect } from "react";
import ReactFlow, { ReactFlowProvider, Controls, MiniMap, Background } from "react-flow-renderer";

import Sidebar from "./Sidebar";
import MultiTargetNode from "../../../components/react-flow/custom_nodes/MultiTargetNode";
import ButtonNode from "../../../components/react-flow/custom_nodes/ButtonNode";
import CommentNode from "../../../components/react-flow/custom_nodes/CommentNode";
import Transformer from "./Transformer";
import Messages from "../message/Messages";

import T from "i18n-react";
import { v4 as uuid_v4 } from "uuid";

import "./Channel.css";
import NodeEditModal from "./NodeEditModal";

import { SmartEdge, SmartEdgeProvider } from "@tisoap/react-flow-smart-edge";

import lodash from "lodash";
import useEventListener from "../../../hooks/useEventListener";
import { Modal, Dropdown, Menu, Space, Tabs, List, Select, Divider, Alert, Popconfirm, Button } from "antd";
import Icon from "@mdi/react";
import { mdiClipboard, mdiCogs, mdiContentCopy, mdiRefresh, mdiScissorsCutting, mdiTrashCan } from "@mdi/js";
import ChannelContextProvider from "../../../providers/channels/ChannelContext";
import AceEditor from "../../../components/ace-editor/AceEditor";
import IconButton from "../../../components/button/IconButton";

import ResizableDrawer from "../../../components/drawer/ResizableDrawer";

const { TabPane } = Tabs;

const customNodes = {
    MultiTargetNode: MultiTargetNode,
    ButtonNode: ButtonNode,
    CommentNode: CommentNode,
};

const Channel = ({
    channel,
    channelStatus,
    undo,
    redo,
    onChannelUpdate,
    nodeTypes,
    debugData,
    debugVisible,
    warningNodeVisible,
    debugClose,
    setWarningIcon,
    warningClose,
    reloadDebug,
}) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [elements, setElements] = useState(undefined);
    const [selectedType, changeSelection] = useState(null);
    const [editNodeVisible, setEditNodeVisible] = useState(false);
    const [drawerWidth, setDraweWidth] = useState(null);
    const [selectedNodes, changeSelectedNodes] = useState(null);
    const [notFoundedValues, setNotFoundedValues] = useState([]);
    const [notFoundedNodes, setNotFoundedNodes] = useState([]);

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
        // console.log(channel);
    }, [channel]);

    /**
     * Comprobación de los codes de las cajas para ver si se encuentran en el package actual.
     *
     *
     */
    useEffect(() => {
        if (channel.nodes && channel.nodes.length > 0 && nodeTypes.length > 0) {
            let nodesChannel = channel.nodes;
            let notFoundedNodes = [];

            //Se comprueba si hay algun nodo con codigo que no este en los nodeTypes
            nodesChannel.forEach((element) => {
                let finded = lodash.filter(nodeTypes, { code: element.type_id });

                if (!finded[0]) {
                    notFoundedNodes.push(element);
                }
            });

            if (notFoundedNodes.length > 0) {
                setNotFoundedNodes(notFoundedNodes);
                //Se añade la label y el valor para el Select
                nodeTypes.forEach(function (element) {
                    element.value = element.name;
                    element.label = element.name;
                });

                setWarningIcon(true);
            } else {
                setWarningIcon(false);
            }
        }
    }, [channel, nodeTypes]);

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

        onMultiNodeEditEnd([{ id, ...newData }]);
    };

    /**
     * Metodo ejecutado al finalizar la edición de una lista de nodos
     * @param {*} newNodeList
     */
    const onMultiNodeEditEnd = (newNodeList) => {
        setEditNodeVisible(false);

        let newChannel = lodash.cloneDeep(channel);

        let newNodes = newChannel.nodes.map((node) => {
            let newData = lodash.find(newNodeList, { id: node.id });
            if (newData) {
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

        addNode(type, position, extra);
    };

    /**
     * Añade un nuevo nodo
     *
     * @param {*} type
     * @param {*} position
     * @param {*} data
     */
    const addNode = (type_id, position, data) => {
        addNodes([{ id: uuid_v4(), type_id, position, data }]);
    };

    /**
     * Añade una lista de nodos
     *
     * @param {*} newNodes
     */
    const addNodes = (newNodes) => {
        let newChannel = lodash.cloneDeep(channel);
        newChannel.nodes.push(
            ...newNodes.map((n) => ({
                ...n,
                links: n.links || [],
            }))
        );
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

    /**
     * Event handler para las acciones de teclado
     */
    useEventListener("keyup", async (event) => {
        //Ignorar el evento si se realiza fuera del tab panel
        if (event.target.className.indexOf("ant-tabs-tabpane") === -1) {
            event.stopPropagation();
            return;
        }
        if (event.keyCode === 67 && event.ctrlKey && !editNodeVisible) {
            console.log("copy pressed");
            await performCopy();

            event.stopPropagation();
        }
        if (event.keyCode === 86 && event.ctrlKey && !editNodeVisible) {
            console.log("paste pressed");

            if (await checkClipboard()) {
                await performPaste();
            }
            event.stopPropagation();
        }
        if (event.keyCode === 88 && event.ctrlKey && !editNodeVisible) {
            console.log("cut pressed");
            await performCut();
            event.stopPropagation();
        }
        if (event.keyCode === 90 && event.ctrlKey && !editNodeVisible) {
            console.log("undo pressed");
            undo();
            event.stopPropagation();
        }
        if (event.keyCode === 89 && event.ctrlKey && !editNodeVisible) {
            console.log("redo pressed");
            redo();
            event.stopPropagation();
        }
    });

    /**
     * Corta los elementos seleccionados en el flujo actual almacenandolos en el portapapeles.
     *
     * @returns
     */
    const performCut = async () => {
        let current = lodash.cloneDeep(
            lodash.filter(channel.nodes, (n) => selectedNodes && lodash.find(selectedNodes, { id: n.id }))
        );
        let strContent = JSON.stringify(current);
        onElementsRemove(lodash.cloneDeep(current));

        await navigator.clipboard.writeText(strContent);
        return strContent;
    };

    /**
     * Copia los elementos seleccionados en el flujo actual almacenandolos en el portapapeles.
     * @returns
     */
    const performCopy = async () => {
        let current = lodash.cloneDeep(
            lodash.filter(channel.nodes, (n) => selectedNodes && lodash.find(selectedNodes, { id: n.id }))
        );
        let strContent = JSON.stringify(current);

        await navigator.clipboard.writeText(strContent);
        return strContent;
    };

    /**
     * Añade elementos al flujo actual en base al portapapeles
     */
    const performPaste = async () => {
        try {
            let clipboardContent = await navigator.clipboard.readText();

            let nodes = JSON.parse(clipboardContent);
            //Recrear los identificadores para evitar duplicidades
            nodes.forEach((el) => {
                const newId = uuid_v4();
                clipboardContent = clipboardContent.replaceAll(el.id, newId);

                //TODO quitar las referencias a nodos que no esten dentro de lo copiado?
            });
            //Volver a procesar el string una vez modificado con los nuevos identificadores
            nodes = JSON.parse(clipboardContent);

            addNodes(
                //Recalcular la posición para no superponer
                nodes.map((n) => ({
                    ...n,
                    position: { x: n.position.x + 50, y: n.position.y + 50 },
                }))
            );
        } catch (ex) {
            console.error(ex);
        }
    };

    const checkClipboard = async () => {
        try {
            const clipboardContent = await navigator.clipboard.readText();

            const nodes = JSON.parse(clipboardContent);
            //TODO check nodes valid

            return true;
        } catch (ex) {
            return false;
        }
    };

    const contextMenu = () => {
        const multiple = selectedNodes && selectedNodes.length > 1;
        const single = selectedNodes && selectedNodes.length === 1;
        const is_node_selected = selectedNodes && selectedNodes.length === 1 && !lodash.has(selectedNodes[0], "target");

        return (
            <Menu>
                {single && is_node_selected && (
                    <>
                        <Menu.Item
                            icon={<Icon path={mdiCogs} size={0.6} />}
                            key="configure"
                            onClick={() => startEditing(selectedNodes[0].id)}>
                            {T.translate("integrations.channel.context_menu.configure")}
                        </Menu.Item>
                        <Menu.Divider />
                    </>
                )}
                {((single && is_node_selected) || multiple) && (
                    <Menu.Item
                        icon={<Icon path={mdiContentCopy} size={0.6} />}
                        key="copy"
                        onClick={() => performCopy()}>
                        {T.translate("integrations.channel.context_menu.copy")}
                    </Menu.Item>
                )}
                {((single && is_node_selected) || multiple) && (
                    <Menu.Item
                        icon={<Icon path={mdiScissorsCutting} size={0.6} />}
                        key="cut"
                        onClick={() => performCut()}>
                        {T.translate("integrations.channel.context_menu.cut")}
                    </Menu.Item>
                )}
                {!single && !multiple && (
                    <Menu.Item
                        icon={<Icon path={mdiClipboard} size={0.6} />}
                        key="paste"
                        onClick={() => performPaste()}>
                        {T.translate("integrations.channel.context_menu.paste")}
                    </Menu.Item>
                )}
                {(single || multiple) && (
                    <>
                        <Menu.Divider />

                        <Menu.Item
                            icon={<Icon path={mdiTrashCan} size={0.6} />}
                            key="delete"
                            onClick={() => onElementsRemove(selectedNodes)}>
                            {T.translate("integrations.channel.context_menu.delete")}
                        </Menu.Item>
                    </>
                )}
            </Menu>
        );
    };

    const editorHeight = "calc(100vh - 430px)";
    return (
        <div>
            <div className="dndflow">
                <ChannelContextProvider currentChannel={channel} currentStatus={channelStatus}>
                    <ReactFlowProvider>
                        <SmartEdgeProvider options={{ debounceTime: 5, nodePadding: 15 }}>
                            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                                <Dropdown overlay={contextMenu()} trigger={["contextMenu"]}>
                                    <ReactFlow
                                        elements={elements}
                                        onConnect={onConnect}
                                        onElementsRemove={onElementsRemove}
                                        onLoad={onLoad}
                                        onDrop={onDrop}
                                        nodeTypes={customNodes}
                                        edgeTypes={{
                                            smart: SmartEdge,
                                        }}
                                        deleteKeyCode={46}
                                        multiSelectionKeyCode={17}
                                        onDragOver={onDragOver}
                                        onSelectionDragStop={(event, nodes) => onMultiNodeEditEnd(nodes)}
                                        onPaneContextMenu={() => changeSelectedNodes([])}
                                        onNodeContextMenu={(event, node) => {
                                            if (selectedNodes == null || selectedNodes?.length < 2) {
                                                console.log("setting");
                                                changeSelectedNodes([node]); //Al hacer click derecho sobre un nodo, si no hay muchos seleccionados, cambiar la seleccion
                                            }
                                        }}
                                        onEdgeContextMenu={(event, node) => {
                                            if (selectedNodes == null || selectedNodes?.length < 2) {
                                                console.log("setting");
                                                changeSelectedNodes([node]); //Al hacer click derecho sobre un nodo, si no hay muchos seleccionados, cambiar la seleccion
                                            }
                                        }}
                                        onNodeDragStop={(event, node) => {
                                            if (selectedNodes != null && selectedNodes?.length > 1) {
                                                onMultiNodeEditEnd(
                                                    lodash.filter(
                                                        reactFlowInstance.getElements(),
                                                        (el) => el.id && lodash.find(selectedNodes, { id: el.id })
                                                    )
                                                );
                                                //Actualmente hay un bug y la selección multiple con Control no funciona del todo bien
                                                //De ahí que se haga la busqueda en los elements de la seleccion y notificar de la modificación de los mismos.
                                                //https://github.com/wbkd/react-flow/issues/1314
                                            } else {
                                                onNodeEditEnd(node.id, {
                                                    position: node.position,
                                                    data: node.data,
                                                });
                                            }
                                        }}
                                        onNodeDoubleClick={(event, node) => startEditing(node.id)}
                                        onSelectionChange={(elements) => changeSelectedNodes(elements)}>
                                        <Controls />
                                        <MiniMap />
                                        <Background />
                                    </ReactFlow>
                                </Dropdown>
                            </div>

                            <Sidebar nodeTypes={nodeTypes} />

                            <NodeEditModal
                                selectedType={selectedType}
                                nodeTypes={nodeTypes}
                                editNodeVisible={editNodeVisible}
                                onEditCancel={() => setEditNodeVisible(false)}
                                onNodeEditEnd={onNodeEditEnd}
                            />
                        </SmartEdgeProvider>
                    </ReactFlowProvider>

                    <ResizableDrawer
                        placement={"right"}
                        title={"Channel Debug"}
                        closable={true}
                        mask={false}
                        getContainer={false}
                        customWidth={drawerWidth}
                        width={500}
                        onClose={() => debugClose()}
                        visible={debugVisible}
                        headerStyle={{ padding: "5px 10px" }}
                        bodyStyle={{ padding: 12 }}
                        key={"debugDrawer"}
                        extra={
                            <Space size="small">
                                <IconButton
                                    key="refresh"
                                    onClick={() => reloadDebug()}
                                    icon={{
                                        path: mdiRefresh,
                                        size: 0.6,
                                        title: T.translate("common.button.reload"),
                                    }}
                                />
                            </Space>
                        }
                        style={{ position: "absolute" }}>
                        <Tabs
                            defaultActiveKey={debugData?.channel?.agent?.id}
                            onChange={(tab) => {
                                if (tab === "messageTab") {
                                    setDraweWidth(800);
                                } else if (drawerWidth) {
                                    setDraweWidth(null);
                                }
                            }}>
                            {debugData &&
                                debugData.logs &&
                                debugData.logs.map((agent) => (
                                    <Tabs.TabPane tab={"Logs: " + agent.agentName} key={agent.agentId}>
                                        <AceEditor
                                            setOptions={{
                                                useWorker: false,
                                            }}
                                            width="100%"
                                            height={editorHeight}
                                            value={agent.data + ""}
                                            name="chann.log"
                                            theme="github"
                                        />
                                    </Tabs.TabPane>
                                ))}

                            <TabPane tab="Canal JSON" key="1">
                                <AceEditor
                                    setOptions={{
                                        useWorker: false,
                                    }}
                                    beautify
                                    width="100%"
                                    height={editorHeight}
                                    value={debugData && debugData.channelJson}
                                    name="DB.code"
                                    mode="json"
                                    theme="github"
                                />
                            </TabPane>
                            <TabPane tab="Camel XML" key="2">
                                <AceEditor
                                    setOptions={{
                                        useWorker: false,
                                    }}
                                    beautify
                                    width="100%"
                                    height={editorHeight}
                                    value={debugData && debugData.channelXml}
                                    name="camel.code"
                                    mode="xml"
                                    theme="github"
                                />
                            </TabPane>
                            <TabPane tab="Mensajes" key="messageTab">
                                <Messages channel={channel} debugData={debugData} />
                            </TabPane>
                        </Tabs>
                    </ResizableDrawer>
                </ChannelContextProvider>
                <Modal
                    width={"40vw"}
                    closable={true}
                    visible={warningNodeVisible}
                    onClose={warningClose}
                    onCancel={warningClose}
                    title={T.translate("integrations.channel.node.type_modal")}
                    onOk={() => {
                        let updatedNodes = [];

                        //Coge los nodos cuyo CODE no ha sido encontrado y le establece el de la selección.
                        notFoundedNodes.forEach((element) => {
                            let found = notFoundedValues.find((item) => {
                                return item.item == element.id;
                            });
                            if (found && found.value) {
                                element.type_id = found.value;
                                updatedNodes.push(element);
                            }
                        });

                        //Se unifica con el array de los nodos del canal.
                        let value = lodash.unionBy(updatedNodes, channel.nodes, "id");
                        channel.nodes = value;

                        //Se actualiza el canal.
                        onChannelUpdate(channel);
                        warningClose();
                    }}>
                    <Alert description={T.translate("integrations.channel.node.info")} color={"#4ab199"} />
                    <Divider></Divider>
                    <List
                        itemLayout="horizontal"
                        dataSource={notFoundedNodes}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    description={item.data && item.data.label ? item.data.label : item.type_id}
                                />

                                <Popconfirm
                                    title={T.translate("common.question")}
                                    onConfirm={() => {
                                        let items = notFoundedNodes;
                                        items = lodash.remove(items, function (n) {
                                            return n != item;
                                        });
                                        onElementsRemove(items);
                                    }}>
                                    <Button style={{ marginRight: 50 }} danger>
                                        {"Delete"}
                                    </Button>
                                </Popconfirm>

                                <Select
                                    showSearch
                                    style={{ width: 250 }}
                                    options={nodeTypes}
                                    onChange={(e, option) => {
                                        let selection = {
                                            value: option.code,
                                            item: item.custom_name ? item.custom_name : item.id,
                                        };
                                        let modalValues = notFoundedValues;

                                        //Se comprueba que no haya duplicados si los hay elimina el elemento y le añade la modificación
                                        let duplicated = lodash.find(modalValues, { item: selection.item });
                                        if (duplicated)
                                            modalValues = lodash.reject(modalValues, { item: selection.item });

                                        //Set Modal values on change
                                        modalValues.push(selection);
                                        setNotFoundedValues(modalValues);
                                    }}
                                />
                            </List.Item>
                        )}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default Channel;
