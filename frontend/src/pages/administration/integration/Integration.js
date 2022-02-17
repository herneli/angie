import Form from "@rjsf/antd";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router";
import T from "i18n-react";
import { Button, notification, message, PageHeader, Popconfirm, Space, Tabs, Tag, Drawer, Alert } from "antd";

import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

import { useHistory } from "react-router";
import Marquee from "react-fast-marquee";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-github";

import lodash from "lodash";
import axios from "axios";
import moment from "moment";

import Channel from "./Channel";

import Transformer from "./Transformer";
import ChannelActions from "./ChannelActions";

import { v4 as uuid_v4 } from "uuid";

import formConfig from "../../../components/rjsf";
import Icon from "@mdi/react";
import {
    mdiCancel,
    mdiMinusBox,
    mdiPlay,
    mdiStop,
    mdiUndo,
    mdiRedo,
    mdiCloseCircleOutline,
    mdiCheckOutline,
    mdiStopCircle,
    mdiPlayCircle,
    mdiTextLong,
    mdiSourceBranchPlus,
    mdiCogs,
    mdiAlertOutline,
    mdiTrashCan,
} from "@mdi/js";
import { useInterval } from "../../../hooks/useInterval";
import PreventTransitionPrompt from "../../../components/PreventTransitionPrompt";
import { usePackage } from "../../../providers/packages/PackageContext";
import EllipsisParagraph from "../../../components/text/EllipsisParagraph";
import IconButton from "../../../components/button/IconButton";
import ChannelOptions from "./ChannelOptions";

import * as api from "../../../api/configurationApi";

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
            deployment_config: {
                type: "object",
                title: "",
                properties: {
                    organization_id: {
                        type: "string",
                        title: "Organización",
                    },
                    enabled: {
                        title: "Activo",
                        type: "boolean",
                        enum: [true, false],
                        enumNames: ["Si", "No"],
                    },
                },
            },
            description: {
                title: "Descripción",
                type: "string",
            },
        },
    },
    uiSchema: {
        name: { "ui:columnSize": 8 },
        deployment_config: {
            organization_id: {
                "ui:columnSize": "6",
                "ui:widget": "SelectRemoteWidget",
                "ui:selectOptions": "/configuration/model/organization/data#path=data&value=id&label=data.name",
            },
            enabled: { "ui:columnSize": 4, "ui:widget": "select" },
        },
        description: { "ui:widget": "textarea" },
    },
};

let channelActions = new ChannelActions();

const Integration = () => {
    const history = useHistory();
    const integForm = useRef(null);

    const { state } = useLocation();
    const { id, channel } = useParams();
    const packageData = usePackage();

    const [currentIntegration, setCurrentIntegration] = useState(null);
    const [activeTab, setActiveTab] = useState();
    const [channels, setChannels] = useState([]);
    const [channelStatuses, setChannelStatus] = useState({});
    const [editHeader, setEditHeader] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(false);
    const [editingChannel, setEditingChannel] = useState({});
    const [editingChannelVisible, setEditingChannelVisible] = useState(false);

    const [debugVisible, setDebugVisible] = useState(false);
    const [warningNodeVisible, setWarningNodeVisible] = useState(false);
    const [warningIcon, setWarningIcon] = useState(false);
    const [debugData, setDebugData] = useState(null);

    const [editHistory, setEditHistory] = useState([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
    const [nodeTypes, setNodeTypes] = useState([]);
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
        loadNodeTypes();
        loadOrganizations();
    }, []);

    /**
     * Interval para ir actualizando en tiempo real el estado de los canales
     */
    useInterval(() => {
        if (!editHeader) loadChannelStatus(currentIntegration);
    }, 30 * 1000);

    /**
     * Si el state cambia es que se ha producido una navegación. Cargar la integración
     */
    useEffect(() => {
        loadIntegration();
    }, [state]);

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
        //setCurrentIntegration(null); //Resetear primero
        setChannels([]);

        if (id === "new") {
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
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadNodeTypes = async () => {
        let filters = {};
        filters[["package_code", "package_version"]] = {
            type: "in",
            value: packageData.dependencies,
        };

        try {
            const types = await api.getModelDataList("node_type", { params: { filters } });
            setNodeTypes(types);
            await Transformer.init(types);
        } catch (ex) {
            console.error(ex);
        }
    };

    /**
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadOrganizations = async () => {
        try {
            const organizations = await api.getModelDataList("organization");
            setOrganizations(organizations);
        } catch (ex) {
            console.error(ex);
        }
    };

    /**
     * Obtiene una organización en base a su id
     * @param {*} id
     * @returns
     */
    const getOrganizationById = (id) => {
        if (!id) return null;
        const org = lodash.find(organizations, { id: id });
        if (!org) return null;
        return { ...org, ...org.data };
    };

    /**
     * Método encargado de obtener una integración del servidor y cargarla en el state.
     * @param {*} identifier
     */
    const fetchIntegration = async (identifier) => {
        setPendingChanges(false);
        try {
            let response;
            if (identifier != "integrations") {
                response = await axios.get("/integration/" + identifier);
            }

            if (response?.data?.data) {
                let { data: integration } = response.data.data;
                setCurrentIntegration(integration);
                setChannelStatus(lodash.mapValues(lodash.keyBy(integration.channels, "id"), "status"));

                setEditHistory([{ ...integration }]);
                if (channel) {
                    setActiveTab(channel);
                } else {
                    setActiveTab(integration && integration.channels[0] && integration.channels[0].id);
                }
            }
        } catch (ex) {
            console.error(ex);
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

                setChannelStatus(statuses);
            }
        } catch (ex) {
            console.error(ex);
        }
    };

    /**
     * Añade un nuevo canal a la lista de la integracion actual
     */
    const addChannel = () => {
        const channelId = uuid_v4();
        const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, animals], style: "lowerCase" });

        const newChannels = onChannelUpdate(
            {
                name: randomName,
                id: channelId,
                created_on: moment().toISOString(),
                version: 0,
                nodes: [],
                options: {
                    trace_file: true,
                    trace_incoming_message: false,
                    trace_headers: false,
                    trace_properties: false,
                    trace_outgoing_message: false,
                },
                enabled: true,
                status: "UNDEPLOYED",
            },
            "add"
        );

        if (newChannels.length === 1) {
            setActiveTab(channelId);
        }
        setChannels(newChannels);
    };

    /**
     * Elimina un canal de la lista de la integracion actual
     *
     * @param {*} targetKey
     * @param {*} active
     */
    const removeChannel = (targetKey, active) => {
        let prevIndex = channels.length !== 0 ? channels.length - 2 : 0;
        if (channels && channels[prevIndex]) {
            let newActiveKey = channels[prevIndex].id;

            if (active === targetKey) {
                setActiveTab(newActiveKey);
            }
        }
        const newChannels = onChannelUpdate({ id: targetKey }, "remove");
        setChannels(newChannels);
    };

    /**
     * Cambia el estado de un canal concreto
     *
     * @param {*} identifier
     */
    const toggleEnabledChannel = async (identifier) => {
        let channel = lodash.find(channels, { id: identifier });
        channel.enabled = !channel.enabled;
        if (!channel.enabled && channel.status === "Started") {
            const resp = await channelActions.undeployChannel(currentIntegration.id, channel.id);
            if (resp) onStatusUpdate(resp.id, resp.status);
        }

        setTimeout(() => {
            let newChannels = onChannelUpdate(channel);
            setChannels(newChannels);
        }, 100);
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
            return addChannel();
        }
        if (action === "remove") {
            return removeChannel(targetKey, activeTab);
        }
    };

    /**
     * Método encargado de confirmar los cambios en el formulario de edición de la cabecera de la integración
     */
    const confirmIntegrationChanges = (data, event) => {
        setEditHeader(false);
        const newIntegration = data.formData;
        setCurrentIntegration(newIntegration);

        onIntegrationChange(newIntegration);

        if (event.forceSave) {
            saveIntegration(newIntegration);
        }
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
    const saveIntegration = async (integration) => {
        try {
            const method = integration.id !== "new" ? "put" : "post";
            const response = await axios[method](
                "/integration" + (integration.id !== "new" ? `/${integration.id}` : ""),
                {
                    ...integration,
                    package_code: packageData.currentPackage.code,
                    package_version: packageData.currentPackage.version,
                }
            );

            if (response?.data?.success) {
                setPendingChanges(false);
                if (integration.id === "new") {
                    //Redirigir al nuevo identificador
                    history.push({
                        pathname: "integrations/" + response.data.data.id,
                    });
                }
                setCurrentIntegration(response.data.data.data);
                // return notification.success({
                //     message: T.translate("common.messages.saved.title"),
                //     description: T.translate("common.messages.saved.description"),
                // });
                return message.success(T.translate("common.messages.saved.title"));
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
                    channel.version += 1; //TODO mejorar versionado canales
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

    const onStatusUpdate = (channelId, status) => {
        const newStatuses = { ...channelStatuses };
        newStatuses[channelId] = status;
        setChannelStatus(newStatuses);
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
        let currentStatus = channelStatuses[activeTab];

        let buttons = [];

        let nodeError = [];
        if (warningIcon) {
            nodeError.push(
                <Marquee pauseOnHover style={{ width: 250 }} gradient={false} warningIcon={false}>
                    <IconButton
                        key="nodeWarning"
                        style={{ backgroundColor: "white" }}
                        onClick={() => showWarningVisible()}
                        icon={{
                            path: mdiAlertOutline,
                            color: "RED",
                            size: 0.6,
                            title: T.translate("common.button.warning"),
                            spin: true,
                        }}>
                        {T.translate("integrations.channel.node.type_modal")}
                    </IconButton>
                </Marquee>
            );
        }

        if (currentStatus === "Started" && activeChannel.enabled) {
            buttons.push(
                <Popconfirm
                    key="undeploy"
                    title={T.translate("common.question")}
                    onConfirm={() => {
                        (async () => {
                            const modifiedChannel = await channelActions.undeployChannel(
                                currentIntegration.id,
                                activeTab
                            );
                            if (modifiedChannel) onStatusUpdate(modifiedChannel.id, modifiedChannel.status);
                        })();
                    }}>
                    <IconButton
                        icon={{
                            path: mdiStopCircle,
                            color: "red",
                            size: 0.6,
                            title: T.translate("integrations.channel.button.undeploy"),
                        }}
                    />
                </Popconfirm>
            );
        } else if (activeChannel.enabled) {
            buttons.push(
                <IconButton
                    key="deploy"
                    onClick={async () => {
                        if (pendingChanges) {
                            return notification.error({
                                message: "Cambios pendientes",
                                description: "Guarde sus cambios para antes de desplegar el canal.",
                            });
                        }

                        if (!currentIntegration?.deployment_config?.enabled) {
                            return notification.error({
                                message: "Integración deshabilitada",
                                description: "Active la integración para poder desplegar sus canales.",
                            });
                        }
                        const modifiedChannel = await channelActions.deployChannel(currentIntegration.id, activeTab);
                        if (modifiedChannel) onStatusUpdate(modifiedChannel.id, modifiedChannel.status);
                    }}
                    icon={{
                        path: mdiPlayCircle,
                        color: "green",
                        size: 0.6,
                    }}
                />
            );
        }

        if (activeChannel.enabled) {
            buttons.push(
                <Popconfirm
                    key="disable"
                    title={T.translate("common.question")}
                    onConfirm={() => {
                        toggleEnabledChannel(activeTab);
                    }}>
                    <IconButton
                        icon={{ path: mdiCloseCircleOutline, size: 0.6, title: T.translate("common.button.disable") }}
                    />
                </Popconfirm>
            );
        } else {
            buttons.push(
                <IconButton
                    key="enable"
                    onClick={() => toggleEnabledChannel(activeTab)}
                    icon={{ path: mdiCheckOutline, size: 0.6, title: T.translate("common.button.enable") }}
                />
            );
        }

        return [
            ...nodeError,
            <IconButton
                key="log"
                onClick={() => showChannelDebug()}
                icon={{ path: mdiTextLong, size: 0.6, title: T.translate("common.button.debug") }}
            />,
            ...buttons,
            <IconButton
                key="edit"
                onClick={() => startEditingChannel()}
                icon={{ path: mdiCogs, size: 0.6, title: T.translate("common.button.edit") }}
            />,
            <IconButton
                key="undo"
                disabled={!editHistory[currentHistoryIndex - 1]}
                onClick={() => undo()}
                icon={{ path: mdiUndo, size: 0.6, title: T.translate("common.button.undo") }}
            />,
            <IconButton
                key="redo"
                disabled={!editHistory[currentHistoryIndex + 1]}
                onClick={() => redo()}
                icon={{ path: mdiRedo, size: 0.6, title: T.translate("common.button.redo") }}
            />,
        ];
    };

    /**
     * Muestra la ventana de debug
     */
    const showChannelDebug = async () => {
        const channel = lodash.find(channels, { id: activeTab });
        if (channel) {
            const logs = await channelActions.getChannelLog(currentIntegration.id, activeTab);
            const { channelJson, channelXml } = await channelActions.getChannelDebug(Transformer, channel);

            setDebugData({
                channel,
                logs,
                channelJson,
                channelXml,
            });
            setDebugVisible(true);
        }
    };

    const showWarningVisible = async () => {
        const channel = lodash.find(channels, { id: activeTab });
        if (channel) {
            setDebugData({
                channel,
            });
            setWarningNodeVisible(true);
        }
    };

    /**
     * Método encargado de pintar los iconos de estado de cada uno de los canales (pestañas)
     */
    const renderChannelStatus = (channel, status) => {
        const currentStatus = status[channel.id];

        if (!channel.enabled)
            return <Icon path={mdiCancel} size={0.6} color="gray" title={T.translate("common.disabled")} />;
        if (currentStatus === "Started")
            return <Icon path={mdiPlay} size={0.6} color="green" title={T.translate("integrations.channel.started")} />;
        if (currentStatus === "Stopped")
            return <Icon path={mdiStop} size={0.6} title={T.translate("integrations.channel.stopped")} />;
        if (currentStatus === "UNDEPLOYED")
            return (
                <Icon
                    path={mdiMinusBox}
                    size={0.6}
                    color="red"
                    title={T.translate("integrations.channel.undeployed")}
                />
            );
    };

    const startEditingChannel = () => {
        const channel = lodash.find(channels, { id: activeTab });
        if (channel) {
            setEditingChannelVisible(true);
            setEditingChannel(channel);
        }
    };

    const editTabOk = ({ formData }) => {
        onChannelUpdate(formData);
        setEditingChannelVisible(false);
    };

    const editTabCancel = () => {
        setEditingChannelVisible(false);
        setEditingChannel({});
    };

    const drawIntegrationStatus = (integ) => {
        if (integ?.deployment_config?.enabled) {
            return <Tag color="green">{T.translate("common.enabled")}</Tag>;
        }
        return <Tag color="red">{T.translate("common.disabled")}</Tag>;
    };

    const renderOrganization = (item) => {
        const org = getOrganizationById(item?.deployment_config?.organization_id);
        return T.translate("integrations.integration_form_subtitle", {
            name: org?.name || "-",
        });
    };

    return (
        <div>
            {!editHeader && (
                <div>
                    <PageHeader
                        ghost={false}
                        title={T.translate("integrations.integration_form_title", { name: currentIntegration?.name })}
                        tags={[
                            <Tag>{renderOrganization(currentIntegration)}</Tag>,
                            drawIntegrationStatus(currentIntegration),
                        ]}
                        avatar={{ icon: <Icon path={mdiSourceBranchPlus} size={0.7} /> }}
                        extra={[
                            <Button key="edit" type="dashed" onClick={() => setEditHeader(true)}>
                                {T.translate("common.button.edit")}
                            </Button>,

                            <Popconfirm
                                title={T.translate("common.question")}
                                onConfirm={() => {
                                    fetchIntegration(currentIntegration.id);
                                }}>
                                <Button key="cancel" danger>
                                    {T.translate("common.button.cancel")}
                                </Button>
                            </Popconfirm>,
                            <Popconfirm
                                title={T.translate("common.question")}
                                onConfirm={() => {
                                    saveIntegration(currentIntegration);
                                }}>
                                <Button key="enable" type="primary">
                                    {T.translate("common.button.save")}
                                </Button>
                            </Popconfirm>,
                        ]}>
                        <div>
                            <EllipsisParagraph text={currentIntegration?.description} maxChars={100} />
                        </div>
                    </PageHeader>
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
                                {T.translate("common.button.confirm")}
                            </Button>,
                            <Popconfirm
                                title={T.translate("common.question")}
                                onConfirm={(e) => {
                                    //Forzar el submit del FORM simulando el evento
                                    integForm.current.onSubmit({
                                        target: null,
                                        currentTarget: null,
                                        preventDefault: () => true,
                                        persist: () => true,
                                        forceSave: true,
                                    });
                                }}>
                                <Button key="enable" type="primary">
                                    {T.translate("integrations.button.confirmSave")}
                                </Button>
                            </Popconfirm>,
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
                                    onSubmit={(data, event) => {
                                        confirmIntegrationChanges(data, event);
                                    }}
                                    onError={(e) => console.log(e)}>
                                    <></>
                                </Form>
                            )}
                        </div>
                    </PageHeader>
                </div>
            )}

            <Tabs
                tabBarExtraContent={<Space size="small">{channels && activeTab && drawStatusButtons()}</Space>}
                type="editable-card"
                onChange={(activeKey) => setActiveTab(activeKey) && console.log("wii")}
                activeKey={activeTab}
                destroyInactiveTabPane={true}
                onEdit={(channelId, action) => {
                    action === "add" && onTabEdit(channelId, action);
                }}>
                {channels.map((channel) => (
                    <TabPane
                        style={{ position: "relative", overflow: "hidden" }}
                        tab={
                            <span>
                                {renderChannelStatus(channel, channelStatuses)} &nbsp; {channel.name}
                            </span>
                        }
                        key={channel.id}
                        closeIcon={
                            <Popconfirm
                                key={`delete_${channel}`}
                                title={T.translate("common.question")}
                                onConfirm={() => {
                                    onTabEdit(channel.id, "remove");
                                }}>
                                <Icon
                                    id="delete-button"
                                    path={mdiTrashCan}
                                    size={0.7}
                                    title={T.translate("integrations.channel.button.delete")}
                                />
                            </Popconfirm>
                        }
                        closable={true}>
                        <Channel
                            channel={channel}
                            channelStatus={channelStatuses[channel.id]}
                            onChannelUpdate={onChannelUpdate}
                            nodeTypes={nodeTypes}
                            undo={undo}
                            redo={redo}
                            debugVisible={debugVisible}
                            warningNodeVisible={warningNodeVisible}
                            setWarningIcon={setWarningIcon}
                            debugData={debugData}
                            warningClose={() => setWarningNodeVisible(false)}
                            debugClose={() => setDebugVisible(false)}
                            reloadDebug={() => showChannelDebug()}
                        />
                    </TabPane>
                ))}
            </Tabs>

            {editingChannelVisible && (
                <ChannelOptions
                    visible={editingChannelVisible}
                    onOk={editTabOk}
                    onCancel={editTabCancel}
                    channel={editingChannel}
                />
            )}

            <PreventTransitionPrompt
                when={pendingChanges}
                title={T.translate("navigation.changes_lost.title")}
                message={T.translate("navigation.changes_lost.message")}
            />
        </div>
    );
};

export default Integration;
