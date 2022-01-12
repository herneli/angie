import Form from "@rjsf/antd";

import { Button, Modal } from "antd";

import T from "i18n-react";
import { useEffect, useRef, useState } from "react";

import formConfig from "../../components/rjsf";
const editTabFormSchema = {
    schema: {
        type: "object",
        required: ["name"],

        properties: {
            options: {
                title: "Opciones",
                type: "object",
                required: ["reconnect_timeout"],
                properties: {
                    redistribute_on_lost: {
                        title: "Redistribuir canales si se pierde la conexión",
                        type: "boolean",
                    },
                    reconnect_timeout: {
                        title: "Tiempo Reconexión",
                        type: "number",
                        default: 30,
                    },
                },
            },
        },
    },
    uiSchema: {
        options: {
            redistribute_on_lost: {
                "ui:widget": "checkbox",
                "ui:columnSize": "8",
            },
            reconnect_timeout: {
                "ui:columnSize": "4",
            },
        },
    },
};

const AgentOptions = ({ visible, onOk, onCancel, agent }) => {
    const editTabFormEl = useRef(null);

    const [editingData, setEditingData] = useState({});

    useEffect(() => {
        if (visible) {
            setEditingData(agent);
        }
    }, [visible]);

    return (
        <Modal
            width={800}
            title={T.translate("agents.options.edit_title")}
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
            <Form
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
            </Form>
        </Modal>
    );
};

export default AgentOptions;
