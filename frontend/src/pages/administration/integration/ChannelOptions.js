import Form from "@rjsf/antd";

import { Button, Modal } from "antd";

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
                required: ["agent_assign_mode","assigned_agent"],
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
                            enum: []
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
            // "ui:order": [
            //     "restart_policy",
            //     "agent_assign_mode",
            //     "assigned_agent",
            //     "trace_file",
            //     "trace_incoming_message",
            //     "trace_headers",
            //     "trace_properties",
            //     "trace_outgoing_message",
            // ],
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
            traced_headers: {
                condition: "deployment_options.trace_headers=true",
                "ui:help":
                    "Clave de las cabeceras que serán almacenadas en el índice de mensajes para su búsqueda o visualización.",
            },
        },
    },
};

const ChannelOptions = ({ visible, onOk, onCancel, channel }) => {
    const editTabFormEl = useRef(null);

    const [editingData, setEditingData] = useState();

    useEffect(() => {
        if (visible) {
            if (!channel.deployment_options) {
                channel.deployment_options = {};
            }
            if (!channel?.deployment_options.assigned_agent) {
                channel.deployment_options.assigned_agent = [];
            }
            setEditingData({ ...channel });
        }
    }, [visible]);

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
                <ConditionalForm
                    ref={editTabFormEl}
                    ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                    ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                    schema={editTabFormSchema.schema}
                    formData={editingData}
                    uiSchema={editTabFormSchema.uiSchema}
                    widgets={formConfig.widgets}
                    onChange={(e) => setEditingData(e.formData)}
                    onSubmit={(e) => onOk(e)}
                    onError={(e) => console.log(e)}>
                    <></>
                </ConditionalForm>
            )}
        </Modal>
    );
};

export default ChannelOptions;
