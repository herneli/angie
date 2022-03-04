import Form from "@rjsf/antd";

import { Button, Modal } from "antd";

import T from "i18n-react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

import formConfig from "../../components/rjsf";

const editTabFormSchema = {
    schema: {
        type: "object",
        required: ["certificate_ids"],

        properties: {
            certificate_ids: {
                type: "array",
                title: "Certificados",
                items: {
                    type: "string",
                    enum: [],
                },
                uniqueItems: true,
            },
        },
    },
    uiSchema: {
        certificate_ids: {
            "ui:columnSize": "6",
            "ui:widget": "SelectRemoteWidget",
            "ui:mode": "multiple",
            "ui:selectOptions": "/configuration/model/certificate/data#path=data&value=id&label=data.code",
        },
    },
};

const AgentCertificates = ({ visible, onOk, onCancel, agent }) => {
    const editTabFormEl = useRef(null);

    const [editingData, setEditingData] = useState({});

    const loadCertificates = async () => {
        let response = await axios.get(`/jum_agent/${agent.id}/get_certificates`);
        if (response.data) {
            agent.certificate_ids = response.data.data.map(item => item.certificate_id);
        } else {
            agent.certificate_ids = [];
        }
        setEditingData(agent);
    };

    useEffect(() => {
        if (visible) {
            loadCertificates();
        }
    }, [visible]);

    return (
        <Modal
            width={800}
            title={T.translate("agents.certificates.edit_title")}
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

export default AgentCertificates;
