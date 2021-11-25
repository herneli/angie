import Form from "@rjsf/antd";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router";
import T from "i18n-react";
import { Button, Modal, notification, PageHeader, Popconfirm, Space, Tabs, Tag } from "antd";

import { useHistory } from "react-router";

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-github";

import lodash from "lodash";
import axios from "axios";
import moment from "moment";

import Channel from "./Channel";

import Transformer from "./Transformer";
import ChannelActions from "./ChannelActions";

import formConfig from "../../../components/rjsf";
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
    mdiBug,
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
                title: "Nombre",
                type: "string",
            },
            enabled: {
                title: "Activo",
                type: "boolean",
                enum: [true, false],
                enumNames: ["Si", "No"],
            },
            description: {
                title: "Descripción",
                type: "string",
            },
        },
    },
    uiSchema: {
        name: { "ui:columnSize": 8 },
        enabled: { "ui:columnSize": 4, "ui:widget": "select" },
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
    const history = useHistory();
    const integForm = useRef(null);
    const editTabFormEl = useRef(null);

    const { state } = useLocation();
    const { id } = useParams();

    const [currentIntegration, setCurrentIntegration] = useState(null);
    const [activeTab, setActiveTab] = useState();
    const [channels, setChannels] = useState([]);
    const [editHeader, setEditHeader] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(false);
    const [editingTab, setEditingTab] = useState({});
    const [editTabVisible, setEditTabVisible] = useState(false);

    const [editHistory, setEditHistory] = useState([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
    const [nodeTypes, setNodeTypes] = useState([]);

    useEffect(() => {
        loadNodeTypes();
    }, []);

    /**
     * Interval para ir actualizando en tiempo real el estado de los canales
     */
    useInterval(() => {
        loadChannelStatus(currentIntegration);
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
    }, [currentIntegration, channels, pendingChanges]);

    /**
     * Si cambia la integracion actual cargar la lista de canales
     */
    useEffect(() => {
        if (currentIntegration) {
            setChannels(currentIntegration.channels);
        }
    }, [currentIntegration]);

    /**
     * Metodo encargado de cargar la integración ya sea desde el state de la navegación o desde el servidor
     */
    const loadIntegration = async () => {
        setCurrentIntegration(null); //Resetear primero
        setChannels([]);

        await Transformer.init();
        if (state && state.record) {
            setCurrentIntegration(state.record);
            setActiveTab(state.record && state.record.channels[0] && state.record.channels[0].id);
            setEditHistory([{ ...state.record }]);

            if (state.new) {
                setEditHeader(true);
            }
        } else if (id === "new") {
            setCurrentIntegration({
                id: "new",
                name: "",
                description: "",
                created_on: moment().toISOString(),
                channels: [],
            });
            setEditHeader(true);
        } else if (id) {
            await fetchIntegration(id);
        }
        setPendingChanges(false);
    };

    /**
     *
     */
    const loadNodeTypes = async () => {
        const response = await axios.get("/configuration/model/node_type/data");

        if (response?.data?.success) {
            setNodeTypes(response?.data?.data);
        } else {
            console.error(response.data);
        }
    };

    /**
     * Método encargado de obtener una integración del servidor y cargarla en el state.
     * @param {*} identifier
     */
    const fetchIntegration = async (identifier) => {
        try {
            const response = await axios.get("/integration/" + identifier);

            if (response?.data?.data) {
                let { data: integration } = response.data.data[0];
                setCurrentIntegration(integration);
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
            if (!integration || integration.id === "new") {
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
            return channelActions.add();
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
        setCurrentIntegration(newIntegration);

        onIntegrationChange(newIntegration);
    };

    /**
     * Evento desencadenado en cada modificación de una integración en el que controlar los cambios pendientes y el histórico
     */
    const onIntegrationChange = (newIntegration) => {
        console.log("Notifying update");
        setPendingChanges(true);

        setEditHistory([...editHistory.slice(0, currentHistoryIndex + 1), { ...newIntegration }]);

        setCurrentHistoryIndex(currentHistoryIndex + 1);
    };

    /**
     * Método que envía al servidor los cambios en memoria
     */
    const saveIntegration = async () => {
        try {
            const method = currentIntegration.id !== "new" ? "put" : "post";
            const response = await axios[method](
                "/integration" + (currentIntegration.id !== "new" ? `/${currentIntegration.id}` : ""),
                currentIntegration
            );

            if (response?.data?.success) {
                setPendingChanges(false);
                if (currentIntegration.id === "new") {
                    //Redirigir al nuevo identificador
                    history.push({
                        pathname: "/admin/integration/" + response.data.data.id,
                    });
                }
                setCurrentIntegration(response.data.data.data);
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
    const onChannelUpdate = (channel, action) => {
        let newChannels = [...channels];
        if (action === "add") {
            newChannels.push(channel);
        } else if (action === "remove") {
            newChannels = channels.filter((chn) => chn.id !== channel.id);
        } else {
            newChannels = channels.map((chn) => {
                if (chn.id === channel.id) {
                    channel.last_updated = moment().toISOString();
                    channel.version += 1; //TODO mejorar?
                    chn = channel;
                }
                return chn;
            });
        }

        const newIntegration = {
            ...currentIntegration,
            channels: newChannels,
        };
        setCurrentIntegration(newIntegration);
        onIntegrationChange(newIntegration);

        return newChannels;
    };

    const undo = () => {
        if (editHistory[currentHistoryIndex - 1]) {
            setCurrentIntegration({ ...editHistory[currentHistoryIndex - 1] });
            setCurrentHistoryIndex(currentHistoryIndex - 1);
        }
    };
    const redo = () => {
        if (editHistory[currentHistoryIndex + 1]) {
            setCurrentIntegration({ ...editHistory[currentHistoryIndex + 1] });
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
                <Popconfirm
                    key="undeploy"
                    title={T.translate("common.question")}
                    onConfirm={() => channelActions.undeployChannel(currentIntegration.id, activeTab, true)}>
                    <Button
                        icon={
                            <Icon
                                path={mdiStopCircle}
                                size={0.6}
                                color="red"
                                title={T.translate("integrations.channel.button.undeploy")}
                            />
                        }
                    />
                </Popconfirm>
            );
        } else if (activeChannel.enabled) {
            buttons.push(
                <Button
                    key="deploy"
                    onClick={() => channelActions.deployChannel(currentIntegration.id, activeTab, true)}
                    icon={
                        <Icon
                            path={mdiPlayCircle}
                            color="green"
                            size={0.6}
                            title={T.translate("integrations.channel.button.deploy")}
                        />
                    }
                />
            );
        }

        if (activeChannel.enabled) {
            buttons.push(
                <Popconfirm
                    key="disable"
                    title={T.translate("common.question")}
                    onConfirm={() => channelActions.toggleEnabled(activeTab)}>
                    <Button
                        icon={
                            <Icon
                                path={mdiCloseCircleOutline}
                                size={0.6}
                                title={T.translate("common.button.disable")}
                            />
                        }
                    />
                </Popconfirm>
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
            <Button
                key="debug"
                onClick={() => showChannelDebug()}
                icon={<Icon path={mdiBug} size={0.6} title={T.translate("common.button.debug")} />}
            />,
            ...buttons,
            <Button
                key="edit"
                onClick={() => startEditingTab()}
                icon={<Icon path={mdiPencil} size={0.6} title={T.translate("common.button.edit")} />}
            />,
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
     * Muestra la ventana de debug
     */
    const showChannelDebug = async () => {
        const channel = lodash.find(channels, { id: activeTab });
        if (channel) {
            let camel = "";
            try {
                camel = await Transformer.fromBDToCamel(channel);
            } catch (ex) {
                console.error(ex);
            }

            Modal.info({
                title: "Debugging Channel",
                width: 800,
                closable: true,
                centered: true,
                content: (
                    <div>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Canal JSON" key="1">
                                <AceEditor
                                    setOptions={{
                                        useWorker: false,
                                    }}
                                    width="100%"
                                    value={JSON.stringify(channel, null, 4)}
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
                                    width="100%"
                                    value={camel}
                                    name="camel.code"
                                    mode="xml"
                                    theme="github"
                                />
                            </TabPane>
                        </Tabs>
                    </div>
                ),
                onOk() {},
            });
        }
    };

    /**
     * Método encargado de pintar los iconos de estado de cada uno de los canales (pestañas)
     */
    const renderChannelStatus = (channel) => {
        if (!channel.enabled)
            return <Icon path={mdiCancel} size={0.6} color="gray" title={T.translate("common.disabled")} />;
        if (channel.status === "STARTED")
            return <Icon path={mdiPlay} size={0.6} color="green" title={T.translate("integrations.channel.started")} />;
        if (channel.status === "STOPPED")
            return <Icon path={mdiStop} size={0.6} title={T.translate("integrations.channel.stopped")} />;
        if (channel.status === "UNDEPLOYED")
            return (
                <Icon
                    path={mdiMinusBox}
                    size={0.6}
                    color="red"
                    title={T.translate("integrations.channel.undeployed")}
                />
            );
    };

    const startEditingTab = () => {
        const channel = lodash.find(channels, { id: activeTab });
        if (channel) {
            setEditTabVisible(true);
            setEditingTab(channel);
        }
    };

    const editTabOk = ({ formData }) => {
        onChannelUpdate(formData);
        setEditTabVisible(false);
    };

    const editTabCancel = () => {
        setEditTabVisible(false);
        setEditingTab({});
    };

    const drawIntegrationStatus = (integ) => {
        if (integ?.enabled) {
            return <Tag color="green">{T.translate("common.enabled")}</Tag>;
        }
        return <Tag color="red">{T.translate("common.disabled")}</Tag>;
    };

    return (
        <div>
            {!editHeader && (
                <div>
                    <PageHeader
                        ghost={false}
                        title={T.translate("integrations.integration_form_title", { name: currentIntegration?.name })}
                        subTitle={currentIntegration?.description}
                        tags={drawIntegrationStatus(currentIntegration)}
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
                        title={T.translate("integrations.integration_edit_title")}
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
                            {currentIntegration && (
                                <Form
                                    ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                                    ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                                    widgets={formConfig.widgets}
                                    ref={integForm}
                                    schema={integrationFormSchema.schema}
                                    formData={currentIntegration}
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
                tabBarExtraContent={
                    <Space size="small">{channels && activeTab && drawStatusButtons(channels, activeTab)}</Space>
                }
                type="editable-card"
                onChange={(activeKey) => setActiveTab(activeKey) && console.log("wii")}
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
                        <Channel channel={channel} onChannelUpdate={onChannelUpdate} nodeTypes={nodeTypes} />
                    </TabPane>
                ))}
            </Tabs>

            <Modal
                width={800}
                title={T.translate("integrations.channel.edit_title")}
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
                            editTabFormEl.current.onSubmit({
                                target: null,
                                currentTarget: null,
                                preventDefault: () => true,
                                persist: () => true,
                            });
                        }}>
                        {T.translate("common.button.accept")}
                    </Button>,
                ]}>
                <Form
                    ref={editTabFormEl}
                    ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                    ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                    schema={editTabFormSchema.schema}
                    formData={editingTab}
                    uiSchema={editTabFormSchema.uiSchema}
                    widgets={formConfig.widgets}
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
