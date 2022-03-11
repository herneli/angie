import Form from "@rjsf/antd";

import { Button, Card, Col, Collapse, Divider, Modal, Row, Slider, Switch, Input } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";

import T from "i18n-react";
import { useEffect, useRef, useState } from "react";

import formConfig from "../../../components/rjsf";
import ConditionalForm from "../../../components/rjsf/custom/ConditionalForm";
const editTabFormSchema = {
    schema: {
        type: "object",
        required: ["name"],

        properties: {
            name: {
                title: "Nombre",
                type: "string",
            },
            deployment_options: {
                title: "Opciones",
                type: "object",
                required: ["agent_assign_mode", "assigned_agent"],
                properties: {
                    restart_policy: {
                        title: "Política Reinicios",
                        type: "string",
                        enum: ["none", "unless_stopped", "allways"],
                        enumNames: ["No hacer nada", "Reiniciar si estaba desplegado", "Reiniciar siempre"],
                        default: "none",
                    },
                    agent_assign_mode: {
                        title: "Modo Asignación Agente",
                        type: "string",
                        enum: ["auto", "fixed"],
                        enumNames: ["Automático", "Fijo"],
                        default: "auto",
                    },
                    assigned_agent: {
                        type: "array",
                        title: "Agentes Asignados",
                        items: {
                            type: "string",
                            enum: [],
                        },
                        uniqueItems: true,
                    },
                    traced_headers: {
                        title: "Trazar Campos Personalizados (headers)",
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                },
            },
        },
    },
    uiSchema: {
        name: {
            "ui:columnSize": "12",
        },
        deployment_options: {
            restart_policy: {
                "ui:columnSize": "12",
                "ui:help": "Comportamiento a ejecutar cuando el agente donde se despliega el canal se reinicia.",
            },
            agent_assign_mode: {
                "ui:columnSize": "4",
            },
            assigned_agent: {
                condition: "deployment_options.agent_assign_mode=fixed",
                "ui:columnSize": "8",
                "ui:widget": "SelectRemoteWidget",
                "ui:mode": "multiple",
                "ui:selectOptions": "/jum_agent#path=data&value=id&label=name",
            },
        },
    },
};
const { Panel } = Collapse;

const ChannelOptions = ({ visible, onOk, onCancel, channel }) => {
    const editTabFormEl = useRef(null);

    const marks = {
        0: T.translate("integrations.channel.trace_headers"),
        33: T.translate("integrations.channel.trace_stats"),
        66: T.translate("integrations.channel.trace_incoming_message"),
        99: T.translate("integrations.channel.trace_outgoing_message"),
    };

    const [editingData, setEditingData] = useState();
    const [levelOfStorage, setLevelOfStorage] = useState(0);
    const [traceProperties, setTraceProperties] = useState(false);
    const [tracefile, setTraceFile] = useState(false);
    const [pruneMetadata, setPruneMetadata] = useState(false);
    const [daysPruneMetadata, setDaysPruneMetadata] = useState(7);
    const [pruneMessages, setPruneMessages] = useState(false);
    const [daysPruneMessages, setDaysPruneMessages] = useState(7);

    const changeProperties = (e) => {
        const { deployment_options } = editingData;
        deployment_options.trace_properties = e;
        setEditingData({ ...editingData, deployment_options });
        channel.deployment_options = deployment_options;
    };

    const changeFile = (e) => {
        const { deployment_options } = editingData;
        deployment_options.trace_file = e;
        setEditingData({ ...editingData, deployment_options });
        channel.deployment_options = deployment_options;
    };

    const changePruneMetadata = (e) => {
        const { deployment_options } = editingData;
        deployment_options.prune_metadata = e;
        setPruneMetadata(e);
        setEditingData({ ...editingData, deployment_options });
        channel.deployment_options = deployment_options;
    };
    
    const changeDaysPruneMetadata = (value) => {
        const { deployment_options } = editingData;
        deployment_options.days_prune_metadata = value;
        setDaysPruneMetadata(value);
        setEditingData({ ...editingData, deployment_options });
        channel.deployment_options = deployment_options;
    };

    const changePruneMessages = (e) => {
        const { deployment_options } = editingData;
        deployment_options.prune_messages = e;
        setPruneMessages(e);
        setEditingData({ ...editingData, deployment_options });
        channel.deployment_options = deployment_options;
    };
    
    const changeDaysPruneMessages = (value) => {
        const { deployment_options } = editingData;
        deployment_options.days_prune_messages = value;
        setDaysPruneMessages(value);
        setEditingData({ ...editingData, deployment_options });
        channel.deployment_options = deployment_options;
    };

    useEffect(() => {
        if (visible) {
            if (!channel.deployment_options) {
                channel.deployment_options = {};
            }
            if (!channel?.deployment_options.assigned_agent) {
                channel.deployment_options.assigned_agent = [];
            }

            if (channel.deployment_options.trace_properties) {
                setTraceProperties(true);
            }
            if (channel.deployment_options.trace_file) {
                setTraceFile(true);
            }

            if (channel.deployment_options.prune_metadata) {
                setPruneMetadata(true);
            }
            if (channel.deployment_options.days_prune_metadata) {
                setDaysPruneMetadata(channel.deployment_options.days_prune_metadata);
            } else {
                channel.deployment_options.days_prune_metadata = daysPruneMetadata;
            }
            if (channel.deployment_options.prune_messages) {
                setPruneMessages(true);
            }
            if (channel.deployment_options.days_prune_messages) {
                setDaysPruneMessages(channel.deployment_options.days_prune_messages);
            } else {
                channel.deployment_options.days_prune_messages = daysPruneMessages;
            }            
            
            //Check level of storage
            if (channel.deployment_options.trace_stats) {
                setLevelOfStorage(33);
            }
            if (channel.deployment_options.trace_incoming_message) {
                setLevelOfStorage(66);
            }
            if (channel.deployment_options.trace_outgoing_message) {
                setLevelOfStorage(99);
            }

            setEditingData({ ...channel });
        }
    }, [visible]);

    const setLevelsOfStorage = (option) => {
        if (channel.deployment_options) {
            delete channel.deployment_options.trace_stats;
            delete channel.deployment_options.trace_incoming_message;
            delete channel.deployment_options.trace_outgoing_message;
        }
        switch (option) {
            case 0:
                break;
            case 33:
                channel.deployment_options.trace_stats = true;
                break;
            case 66:
                channel.deployment_options.trace_stats = true;
                channel.deployment_options.trace_incoming_message = true;
                break;
            case 99:
                channel.deployment_options.trace_stats = true;
                channel.deployment_options.trace_incoming_message = true;
                channel.deployment_options.trace_outgoing_message = true;
                break;
            default:
                break;
        }
        if (!editingData) {
            editingData = {};
        }
        editingData.deployment_options = channel.deployment_options;
        setEditingData(editingData);
    };

    return (
        <Modal
            width={800}
            title={T.translate("integrations.channel.edit_title")}
            visible={visible}
            onOk={onOk}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" type="dashed" onClick={onCancel}>
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
            {editingData && (
                <>
                    <ConditionalForm
                        ref={editTabFormEl}
                        ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                        ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                        schema={editTabFormSchema.schema}
                        formData={editingData}
                        uiSchema={editTabFormSchema.uiSchema}
                        widgets={formConfig.widgets}
                        onChange={(e) => setEditingData(e.formData)}
                        onSubmit={(e) => {
                            e.formData = editingData;
                            onOk(e);
                        }}
                        onError={(e) => console.log(e)}>
                        <></>
                    </ConditionalForm>
                    <Collapse accordion defaultActiveKey="1">
                        <Panel header={T.translate("integrations.channel.trace_levels")} key="1">
                            <Row>
                                <Col span={12}>
                                    <div style={{ display: "block", height: 300, marginLeft: 70 }}>
                                        <Slider
                                            vertical
                                            marks={marks}
                                            tooltipVisible={false}
                                            step={null}
                                            defaultValue={levelOfStorage}
                                            onChange={(e) => {
                                                setLevelsOfStorage(e);
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Divider style={{ height: 300 }} type="vertical" />
                                <Col span={10}>
                                    <p>{T.translate("integrations.channel.additional_props")}</p>
                                    <Divider/>
                                    <div style={{ display: "flex", width: "100%", justifyContent: "space-around"}}>
                                        <Switch 
                                            checkedChildren={T.translate("integrations.channel.trace_logs")} 
                                            unCheckedChildren={T.translate("integrations.channel.trace_logs_no")} 
                                            defaultChecked={tracefile} 
                                            onChange={(e) => { changeFile(e) }} />
                                        <Switch 
                                            checkedChildren={T.translate("integrations.channel.trace_properties")} 
                                            unCheckedChildren={T.translate("integrations.channel.trace_properties_no")} 
                                            defaultChecked={traceProperties} 
                                            onChange={(e) => { changeProperties(e) }} />
                                    </div>
                                    <Divider/>
                                    <p>{T.translate("integrations.channel.prune_configuration")}</p>
                                    <div style={{ display: "flex", width: "100%", justifyContent: "space-around"}}>
                                        <Switch 
                                            checkedChildren={T.translate("integrations.channel.prune_metadata")} 
                                            unCheckedChildren={T.translate("integrations.channel.prune_metadata_no")} 
                                            defaultChecked={pruneMetadata} 
                                            onChange={(e) => { changePruneMetadata(e) }} />
                                        <Switch 
                                            checkedChildren={T.translate("integrations.channel.prune_messages")} 
                                            unCheckedChildren={T.translate("integrations.channel.prune_messages_no")} 
                                            defaultChecked={pruneMessages} 
                                            onChange={(e) => { changePruneMessages(e) }} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "space-around", padding:"10px"}}>
                                        <Input 
                                            style={{ marginTop: "10px" }}
                                            disabled={!pruneMetadata}
                                            addonBefore={T.translate("integrations.channel.days_prune_metadata")} 
                                            value={daysPruneMetadata} type="number" 
                                            onChange={(e) => changeDaysPruneMetadata(e.target.value)} />
                                        <Input 
                                            style={{ marginTop: "10px" }}
                                            disabled={!pruneMessages}
                                            addonBefore={T.translate("integrations.channel.days_prune_messages")} 
                                            value={daysPruneMessages} type="number" 
                                            onChange={(e) => changeDaysPruneMessages(e.target.value)} />
                                    </div>
                                 </Col>
                            </Row>
                        </Panel>
                    </Collapse>
                </>
            )}
        </Modal>
    );
};

export default ChannelOptions;
