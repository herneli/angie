import Form from "@rjsf/antd";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router";
import T from "i18n-react";
import { Button, Modal, notification, message, PageHeader, Popconfirm, Space, Tabs, Tag, Typography } from "antd";

import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

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
    mdiPencil,
    mdiCloseCircleOutline,
    mdiCheckOutline,
    mdiStopCircle,
    mdiPlayCircle,
    mdiBug,
    mdiTextLong,
    mdiSourceBranchPlus,
} from "@mdi/js";
import { useInterval } from "../../../common/useInterval";
import PreventTransitionPrompt from "../../../components/PreventTransitionPrompt";
import { usePackage } from "../../../components/packages/PackageContext";

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
const editTabFormSchema = {
    schema: {
        type: "object",
        required: ["name"],
        properties: {
            name: {
                title: "Nombre",
                type: "string",
            },
            options: {
                title: "Opciones",
                description: "Configura diferentes opciones de comportamiento a nivel del canal.",
                type: "object",
                properties: {
                    trace_file: {
                        title: "Traza Completa (Archivo log)",
                        type: "boolean",
                    },
                    trace_incoming_message: {
                        title: "Almacenar Mensaje Recibido (Elastic)",
                        type: "boolean",
                    },
                    trace_headers: {
                        title: "Almacenar Cabeceras (Elastic)",
                        type: "boolean",
                    },
                    trace_properties: {
                        title: "Almacenar Propiedades (Elastic)",
                        type: "boolean",
                    },
                    trace_outgoing_message: {
                        title: "Almacenar Mensaje Salida (Elastic)",
                        type: "boolean",
                    },
                },
            },
        },
    },
    uiSchema: {
        name: {
            "ui:columnSize": "8",
        },
        options: {
            trace_file: {
                "ui:widget": "checkbox",
                "ui:columnSize": "4",
            },
            trace_incoming_message: {
                "ui:widget": "checkbox",
                "ui:columnSize": "4",
            },
            trace_headers: {
                "ui:widget": "checkbox",
                "ui:columnSize": "4",
            },
            trace_properties: {
                "ui:widget": "checkbox",
                "ui:columnSize": "4",
            },
            trace_outgoing_message: {
                "ui:widget": "checkbox",
                "ui:columnSize": "4",
            },
        },
    },
};
let channelActions = new ChannelActions();

const Integration = ({ packageUrl }) => {
    const history = useHistory();
    const integForm = useRef(null);
    const editTabFormEl = useRef(null);

    const { state } = useLocation();
    const { id, channel } = useParams();
    const packageData = usePackage();

    const [currentIntegration, setCurrentIntegration] = useState(null);
    const [activeTab, setActiveTab] = useState();
    const [channels, setChannels] = useState([]);
    const [channelStatuses, setChannelStatus] = useState({});
    const [editHeader, setEditHeader] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(false);
    const [editingTab, setEditingTab] = useState({});
    const [editTabVisible, setEditTabVisible] = useState(false);

    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

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
            setChannelStatus(lodash.mapValues(lodash.keyBy(currentIntegration.channels, "id"), "status"));
        }
    }, [currentIntegration]);

    /**
     * Metodo encargado de cargar la integración ya sea desde el state de la navegación o desde el servidor
     */
    const loadIntegration = async () => {
        setCurrentIntegration(null); //Resetear primero
        setChannels([]);

        if (state && state.record) {
            setCurrentIntegration(state.record);
            if (channel) {
                setActiveTab(channel);
            } else {
                setActiveTab(state.record && state.record.channels[0] && state.record.channels[0].id);
            }
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
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadNodeTypes = async () => {
        let filters = {};
        filters[["package_code", "package_version"]] = {
            type: "in",
            value: packageData.dependencies,
        };
        const response = await axios.get("/configuration/model/node_type/data", { params: { filters } });

        if (response?.data?.success) {
            setNodeTypes(response?.data?.data);

            await Transformer.init(response?.data?.data);
        } else {
            console.error(response.data);
        }
    };

    /**
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadOrganizations = async () => {
        const response = await axios.get("/configuration/model/organization/data");

        if (response?.data?.success) {
            setOrganizations(response?.data?.data);
        } else {
            console.error(response.data);
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
        try {
            const response = await axios.get("/integration/" + identifier);

            if (response?.data?.data) {
                let { data: integration } = response.data.data;
                setCurrentIntegration(integration);
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
            setTimeout(saveIntegration, 200);
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
    const saveIntegration = async () => {
        try {
            const method = currentIntegration.id !== "new" ? "put" : "post";
            const response = await axios[method](
                "/integration" + (currentIntegration.id !== "new" ? `/${currentIntegration.id}` : ""),
                {
                    ...currentIntegration,
                    package_code: packageData.currentPackage.code,
                    package_version: packageData.currentPackage.version,
                }
            );

            if (response?.data?.success) {
                setPendingChanges(false);
                if (currentIntegration.id === "new") {
                    //Redirigir al nuevo identificador
                    history.push({
                        pathname: packageUrl + "/integrations/" + response.data.data.id,
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

        if (currentStatus === "Started" && activeChannel.enabled) {
            buttons.push(
                <Popconfirm
                    key="undeploy"
                    title={T.translate("common.question")}
                    onConfirm={async () => {
                        const modifiedChannel = await channelActions.undeployChannel(currentIntegration.id, activeTab);
                        if (modifiedChannel) onStatusUpdate(modifiedChannel.id, modifiedChannel.status);
                    }}>
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
                    onConfirm={() => toggleEnabledChannel(activeTab)}>
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
                    onClick={() => toggleEnabledChannel(activeTab)}
                    icon={<Icon path={mdiCheckOutline} size={0.6} title={T.translate("common.button.enable")} />}
                />
            );
        }
        return [
            <Button
                key="log"
                onClick={() => showChannelLog()}
                icon={<Icon path={mdiTextLong} size={0.6} title={T.translate("common.button.debug")} />}
            />,
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
     * Muestra la ventana de debug
     */
    const showChannelLog = async () => {
        if (activeTab) {
            const response = await axios.get(`/integration/${currentIntegration.id}/channel/${activeTab}/log`);

            Modal.info({
                title: "Log Channel",
                width: "60vw",
                closable: true,
                centered: true,
                content: (
                    <div>
                        <AceEditor
                            setOptions={{
                                useWorker: false,
                            }}
                            width="100%"
                            value={response.data.data}
                            name="chann.log"
                            theme="github"
                        />
                    </div>
                ),
                onOk() {},
            });
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
        if (integ?.deployment_config?.enabled) {
            return <Tag color="green">{T.translate("common.enabled")}</Tag>;
        }
        return <Tag color="red">{T.translate("common.disabled")}</Tag>;
    };

    const descriptionEllipsis = (description) => {
        if (!description) return "";
        const splitted = description.split("\n");
        return splitted[0].substring(0, 200);
    };

    return (
        <div>
            {!editHeader && (
                <div>
                    <PageHeader
                        ghost={false}
                        title={T.translate("integrations.integration_form_title", { name: currentIntegration?.name })}
                        subTitle={T.translate("integrations.integration_form_subtitle", {
                            name: getOrganizationById(currentIntegration?.deployment_config?.organization_id)?.name,
                        })}
                        tags={drawIntegrationStatus(currentIntegration)}
                        avatar={{icon: <Icon path={mdiSourceBranchPlus} size={0.7} />}}
                        extra={[
                            <Button key="edit" type="dashed" onClick={() => setEditHeader(true)}>
                                {T.translate("common.button.edit")}
                            </Button>,

                            <Popconfirm
                                title={T.translate("common.question")}
                                onConfirm={() => fetchIntegration(currentIntegration.id)}>
                                <Button key="cancel" danger>
                                    {T.translate("common.button.cancel")}
                                </Button>
                            </Popconfirm>,
                            <Popconfirm title={T.translate("common.question")} onConfirm={() => saveIntegration()}>
                                <Button key="enable" type="primary">
                                    {T.translate("common.button.save")}
                                </Button>
                            </Popconfirm>,
                        ]}>
                        <div>
                            <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }} type="secondary">
                                {descriptionExpanded && currentIntegration?.description}
                                {!descriptionExpanded && descriptionEllipsis(currentIntegration?.description) + "..."}
                                {!descriptionExpanded && (
                                    <Typography.Link onClick={() => setDescriptionExpanded(true)}> mas</Typography.Link>
                                )}
                                {descriptionExpanded && (
                                    <Typography.Link onClick={() => setDescriptionExpanded(false)}>
                                        <br /> menos
                                    </Typography.Link>
                                )}
                            </Typography.Paragraph>
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
                                {renderChannelStatus(channel, channelStatuses)} &nbsp; {channel.name}
                            </span>
                        }
                        key={channel.id}
                        closable={true}>
                        <Channel
                            channel={channel}
                            channelStatus={channelStatuses[channel.id]}
                            onChannelUpdate={onChannelUpdate}
                            nodeTypes={nodeTypes}
                            undo={undo}
                            redo={redo}
                        />
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
