import Form from "@rjsf/antd";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router";
import T from "i18n-react";
import { Button, Modal, notification, PageHeader, Popconfirm, Space, Tabs, Tag } from "antd";

import lodash from "lodash";
import axios from "axios";

import Channel from "./Channel";

import Transformer from "./Transformer";
import ChannelActions from "./ChannelActions";
import Icon from "@mdi/react";
import {
    mdiCancel,
    mdiMinusBox,
    mdiPlay,
    mdiStop,
    mdiUndo,
    mdiRedo,
    mdiPencil,
    mdiCloseCircleOutline,
    mdiCheckOutline,
    mdiStopCircle,
    mdiPlayCircle,
} from "@mdi/js";
import { useInterval } from "../../../common/useInterval";
import PreventTransitionPrompt from "../../../components/PreventTransitionPrompt";

const { TabPane } = Tabs;

const integrationFormSchema = {
    schema: {
        type: "object",
        required: ["name", "description"],
        properties: {
            name: {
                type: "string",
            },
            description: {
                type: "string",
            },
        },
    },
    uiSchema: {
        description: { "ui:widget": "textarea" },
    },
};
const editTabFormSchema = {
    schema: {
        type: "object",
        required: ["name"],
        properties: {
            name: {
                type: "string",
            },
        },
    },
    uiSchema: {},
};
let channelActions;

const Integration = () => {
    const integForm = useRef(null);
    const editTabFormEl = useRef(null);

    const { state } = useLocation();
    const { id } = useParams();

    const [currentRecord, setCurrentRecord] = useState(null);
    const [activeTab, setActiveTab] = useState();
    const [channels, setChannels] = useState([]);
    const [editHeader, setEditHeader] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(false);
    const [editingTab, setEditingTab] = useState({});
    const [editTabVisible, setEditTabVisible] = useState(false);

    const [editHistory, setEditHistory] = useState([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

    /**
     * Interval para ir actualizando en tiempo real el estado de los canales
     */
    useInterval(() => {
        loadChannelStatus(currentRecord);
    }, 30 * 1000);

    /**
     * Si el state cambia es que se ha producido una navegación. Cargar la integración
     */
    useEffect(() => {
        loadIntegration();
    }, [state]);

    /**
     * Reinstanciar channelActions con los ultimos cambios en el state
     */
    useEffect(() => {
        channelActions = new ChannelActions(channels, pendingChanges, setChannels, setActiveTab, onChannelUpdate);
    }, [channels, pendingChanges]);

    /**
     * Si cambia la integracion actual cargar la lista de canales
     */
    useEffect(() => {
        if (currentRecord) {
            setChannels(currentRecord.channels);
        }
    }, [currentRecord]);

    /**
     * Metodo encargado de cargar la integración ya sea desde el state de la navegación o desde el servidor
     */
    const loadIntegration = async () => {
        setCurrentRecord(null); //Resetear primero
        setChannels([]);

        await Transformer.init();
        if (state && state.record) {
            setCurrentRecord(state.record);
            setActiveTab(state.record && state.record.channels[0] && state.record.channels[0].id);
            setEditHistory([{ ...state.record }]);

            if (state.new) {
                setEditHeader(true);
            }
        } else if (id) {
            await fetchIntegration(id);
        }
        setPendingChanges(false);
    };

    /**
     * Método encargado de obtener una integración del servidor y cargarla en el state.
     * @param {*} identifier
     */
    const fetchIntegration = async (identifier) => {
        try {
            const response = await axios.get("/integration/" + identifier);

            if (response?.data?.data) {
                let integration = response.data.data[0];
                setCurrentRecord(integration);
                setEditHistory([{ ...integration }]);
                setActiveTab(integration && integration.channels[0] && integration.channels[0].id);
            }
        } catch (ex) {
            return notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
    };

    /**
     * Método encargado de obtener los estados de los canales y actualizarlos en el state
     * @param {*} integration
     * @returns
     */
    const loadChannelStatus = async function (integration) {
        try {
            if (!integration) {
                return console.log("No Integration?");
            }
            const response = await axios.get(`/integration/${integration.id}/channels/status`);

            if (response?.data?.data) {
                const statuses = response.data.data;

                const newChannels = channels.map((chn) => {
                    chn.status = statuses[chn.id] || chn.status;
                    return chn;
                });
                setChannels(newChannels);
            }
        } catch (ex) {
            console.error(ex);
        }
    };

    /**
     * Evento desencadenado al realizar una acción de añadir o borrar sobre el panel de pestañas
     *
     * @param {*} targetKey
     * @param {*} action
     * @returns
     */
    const onTabEdit = (targetKey, action) => {
        if (action === "add") {
            return channelActions.add(currentRecord.id);
        }
        if (action === "remove") {
            return channelActions.remove(targetKey, activeTab);
        }
    };

    /**
     * Método encargado de confirmar los cambios en el formulario de edición de la cabecera de la integración
     */
    const confirmIntegrationChanges = (values) => {
        setEditHeader(false);
        const newIntegration = values.formData;
        setCurrentRecord(newIntegration);

        onIntegrationChange(newIntegration);
    };

    /**
     * Evento desencadenado en cada modificación de una integración en el que controlar los cambios pendientes y el histórico
     */
    const onIntegrationChange = (newIntegration) => {
        console.log("Notifying update");
        setPendingChanges(true);

        setCurrentHistoryIndex(currentHistoryIndex + 1);

        setEditHistory([...editHistory.slice(0, currentHistoryIndex + 1), { ...newIntegration }]);
    };

    /**
     * Método que envía al servidor los cambios en memoria
     */
    const saveIntegration = async () => {
        try {
            const response = await axios.post("/integration/full/", currentRecord);

            if (response?.data?.success) {
                setPendingChanges(false);
                return notification.success({
                    message: T.translate("common.messages.saved.title"),
                    description: T.translate("common.messages.saved.description"),
                });
            }
        } catch (ex) {
            return notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }

        setPendingChanges(true);
    };

    /**
     * Método utilizado para actualizar un canal concreto en el state del componente y desencadenar las acciones de:
     *
     * - pendinChanges
     * - actionHistory
     *
     * @param {*} channel
     * @returns
     */
    const onChannelUpdate = (channel) => {
        let newChannels = channels.map((chn) => {
            if (chn.id === channel.id) {
                chn = channel;
            }
            return chn;
        });
        const newIntegration = {
            ...currentRecord,
            channels: newChannels,
        };
        setCurrentRecord(newIntegration);
        onIntegrationChange(newIntegration);

        return newChannels;
    };

    const undo = () => {
        if (editHistory[currentHistoryIndex - 1]) {
            setChannels([]);
            setCurrentRecord({ ...editHistory[currentHistoryIndex - 1] });
            setCurrentHistoryIndex(currentHistoryIndex - 1);
        }
    };
    const redo = () => {
        if (editHistory[currentHistoryIndex + 1]) {
            setChannels([]);
            setCurrentRecord({ ...editHistory[currentHistoryIndex + 1] });
            setCurrentHistoryIndex(currentHistoryIndex + 1);
        }
    };

    /**
     * Método encargado de pintar los botones de control en función del estado de un canal.
     */
    const drawStatusButtons = () => {
        let activeChannel = lodash.find(channels, { id: activeTab });
        if (!activeChannel) return [];

        let buttons = [];

        if (activeChannel.status === "STARTED" && activeChannel.enabled) {
            buttons.push(
                <Button
                    key="undeploy"
                    onClick={() => channelActions.undeployChannel(activeTab)}
                    icon={<Icon path={mdiStopCircle} size={0.6} color="red" title={T.translate("common.button.undeploy")} />}
                />
            );
        } else if (activeChannel.enabled) {
            buttons.push(
                <Button
                    key="deploy"
                    onClick={() => channelActions.deployChannel(activeTab)}
                    icon={<Icon path={mdiPlayCircle} color="green" size={0.6} title={T.translate("common.button.deploy")} />}
                />
            );
        }

        if (activeChannel.enabled) {
            buttons.push(
                <Button
                    key="disable"
                    onClick={() => channelActions.toggleEnabled(activeTab)}
                    icon={<Icon path={mdiCloseCircleOutline} size={0.6} title={T.translate("common.button.disable")} />}
                />
            );
        } else {
            buttons.push(
                <Button
                    key="enable"
                    onClick={() => channelActions.toggleEnabled(activeTab)}
                    icon={<Icon path={mdiCheckOutline} size={0.6} title={T.translate("common.button.enable")} />}
                />
            );
        }
        return [
            ...buttons,
            <Button key="edit" onClick={() => startEditingTab()} icon={<Icon path={mdiPencil} size={0.6} title={T.translate("common.button.edit")} />} />,
            <Button
                key="undo"
                disabled={!editHistory[currentHistoryIndex - 1]}
                onClick={() => undo()}
                icon={<Icon path={mdiUndo} size={0.6} title={T.translate("common.button.undo")} />}
            />,
            <Button
                key="redo"
                disabled={!editHistory[currentHistoryIndex + 1]}
                onClick={() => redo()}
                icon={<Icon path={mdiRedo} size={0.6} title={T.translate("common.button.redo")} />}
            />,
        ];
    };

    /**
     * Método encargado de pintar los iconos de estado de cada uno de los canales (pestañas)
     */
    const renderChannelStatus = (channel) => {
        if (!channel.enabled) return <Icon path={mdiCancel} size={0.6} color="gray" title={T.translate("common.disabled")} />;
        if (channel.status === "STARTED") return <Icon path={mdiPlay} size={0.6} color="green" title={T.translate("integration.channel.started")} />;
        if (channel.status === "STOPPED") return <Icon path={mdiStop} size={0.6} title={T.translate("integration.channel.stopped")} />;
        if (channel.status === "UNDEPLOYED") return <Icon path={mdiMinusBox} size={0.6} color="red" title={T.translate("integration.channel.undeployed")} />;
    };

    const startEditingTab = () => {
        const channel = lodash.find(channels, { id: activeTab });
        if (channel) {
            setEditTabVisible(true);
            setEditingTab(channel);
        }
    };

    const editTabOk = ({ formData }) => {
        console.log(formData);
        onChannelUpdate(formData);
        setEditTabVisible(false);
    };

    const editTabCancel = () => {
        setEditTabVisible(false);
        setEditingTab({});
    };

    return (
        <div>
            {!editHeader && (
                <div>
                    <PageHeader
                        ghost={false}
                        title={T.translate("integrations.integration_form_title", { name: currentRecord?.name })}
                        subTitle={currentRecord?.description}
                        tags={<Tag color="green">{T.translate("common.enabled")}</Tag>}
                        extra={[
                            <Button key="edit" type="dashed" onClick={() => setEditHeader(true)}>
                                {T.translate("common.button.edit")}
                            </Button>,

                            <Popconfirm title={T.translate("common.question")} onConfirm={() => loadIntegration()}>
                                <Button key="cancel" danger>
                                    {T.translate("common.button.cancel")}
                                </Button>
                            </Popconfirm>,
                            <Popconfirm title={T.translate("common.question")} onConfirm={() => saveIntegration()}>
                                <Button key="enable" type="primary">
                                    {T.translate("common.button.save")}
                                </Button>
                            </Popconfirm>,
                        ]}
                    />
                </div>
            )}
            {editHeader && (
                <div>
                    <PageHeader
                        ghost={false}
                        title={`${T.translate("integrations.integration_edit_title")} `}
                        tags={<Tag color="green">{T.translate("common.enabled")}</Tag>}
                        extra={[
                            <Button key="cancel" type="dashed" onClick={() => setEditHeader(false)}>
                                {T.translate("common.button.cancel")}
                            </Button>,
                            <Button
                                key="accept"
                                type="primary"
                                onClick={(e) => {
                                    //Forzar el submit del FORM simulando el evento
                                    integForm.current.onSubmit({
                                        target: null,
                                        currentTarget: null,
                                        preventDefault: () => true,
                                        persist: () => true,
                                    });
                                }}>
                                {T.translate("common.button.accept")}
                            </Button>,
                        ]}>
                        <div>
                            {currentRecord && (
                                <Form
                                    ref={integForm}
                                    schema={integrationFormSchema.schema}
                                    formData={currentRecord}
                                    uiSchema={integrationFormSchema.uiSchema}
                                    onSubmit={(e) => confirmIntegrationChanges(e)}
                                    onError={(e) => console.log(e)}>
                                    <></>
                                </Form>
                            )}
                        </div>
                    </PageHeader>
                </div>
            )}

            <Tabs
                tabBarExtraContent={<Space size="small">{channels && activeTab && drawStatusButtons(channels, activeTab)}</Space>}
                type="editable-card"
                onChange={(activeKey) => setActiveTab(activeKey) && console.log('wii')}
                activeKey={activeTab}
                destroyInactiveTabPane={true}
                onEdit={onTabEdit}>
                {channels.map((channel) => (
                    <TabPane
                        tab={
                            <span>
                                {renderChannelStatus(channel)} &nbsp; {channel.name}
                            </span>
                        }
                        key={channel.id}
                        closable={true}>
                        <Channel channel={channel} onChannelUpdate={onChannelUpdate} />
                    </TabPane>
                ))}
            </Tabs>

            <Modal
                width={800}
                title="Editar Elemento"
                visible={editTabVisible}
                onOk={editTabOk}
                onCancel={editTabCancel}
                footer={[
                    <Button key="cancel" type="dashed" onClick={() => editTabCancel()}>
                        {T.translate("common.button.cancel")}
                    </Button>,
                    <Button
                        key="accept"
                        type="primary"
                        onClick={(e) => {
                            //Forzar el submit del FORM simulando el evento
                            editTabFormEl.current.onSubmit({ target: null, currentTarget: null, preventDefault: () => true, persist: () => true });
                        }}>
                        {T.translate("common.button.accept")}
                    </Button>,
                ]}>
                <Form
                    ref={editTabFormEl}
                    schema={editTabFormSchema.schema}
                    formData={editingTab}
                    uiSchema={editTabFormSchema.uiSchema}
                    onChange={(e) => setEditingTab(e.formData)}
                    onSubmit={(e) => editTabOk(e)}
                    onError={(e) => console.log(e)}>
                    <></>
                </Form>
            </Modal>

            <PreventTransitionPrompt
                when={pendingChanges}
                title={T.translate("navigation.changes_lost.title")}
                message={T.translate("navigation.changes_lost.message")}
            />
        </div>
    );
};

export default Integration;
