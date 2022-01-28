import Form from "@rjsf/antd";

import { Button, Modal } from "antd";

import T from "i18n-react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

import formConfig from "../../components/rjsf";

const editTabFormSchema = {
    schema: {
        type: "object",
        required: ["libraries"],
        properties: {
            libraries: {
                title: T.translate("agents.libraries.title"),
                type: "array",
                items: {
                    type: "object",
                    required: [
                        "is_camel",
                        "group_id",
                        "artifact_id"
                    ],
                    properties: {
                        is_camel: {
                            title: "Camel",
                            type: "string",
                            enum: [
                                "yes",
                                "no"
                            ],
                            enumNames: [
                                "Yes",
                                "No"
                            ]
                        },
                        group_id: {
                            title: "groupId",
                            type: "string"
                        },
                        artifact_id: {
                            title: "artifactId",
                            type: "string"
                        }
                    },
                    dependencies: {
                        is_camel: {
                            oneOf: [
                                {
                                    properties: {
                                        is_camel: {"enum": ["yes"]},
                                        group_id: {"enum": ["org.apache.camel"]}
                                    }
                                },
                                {
                                    properties: {
                                        is_camel: {"enum": ['no']},
                                        version: {
                                            title: "version",
                                            type: "string"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                 }
            },
        },
    },
    uiSchema: {
        libraries: {
            library: {
                "ui:columnSize": "4",
           
            },
            is_camel: {
                "ui:widget":"checkbox",
            },
         
        },
    },
};

const agentSchema ={
    libraries: {
        library: {
            "ui:columnSize": "4",
       
        },
        is_camel: {
            "ui:widget":"checkbox",
        },   
        "ui:options": {
            "addable": false,
            "removable": false
        }
     
    },
}

const AgentLibraries = ({ visible, onOk, onCancel,child,agent }) => {
    const editTabFormEl = useRef(null);

    const [editingData, setEditingData] = useState({});

    const loadLibraries = async () => {
        if(agent){
            //Si es del agente coge las dependencias del agente (boton tabla)
            let response = await axios.get(`/jum_agent/${agent.id}/get_dependencies`);
            if(response.data){
                response.data.data.map(elto => elto.is_camel = elto.group_id === 'org.apache.camel' ? 'yes' : 'no')
                setEditingData({ libraries: response.data.data });
            }
        }else{

            let response = await axios.get(`/library`);
            response.data.data.map(elto => elto.is_camel = elto.group_id === 'org.apache.camel' ? 'yes' : 'no')
            setEditingData({ libraries: response.data.data });

        }
    }

    const handleChange = (formData) => {
        if (formData.libraries) {
            for (const library of formData.libraries) {
                if (library.group_id && library.group_id.indexOf("org.apache.camel") != -1) {
                    library.version = "";
                    console.log("igual");
                }
            }
        }
        setEditingData(formData);
    }

    useEffect(() => {
        if (visible) {
            setEditingData(loadLibraries());
        }
    }, [visible]);

    return (
        <Modal
            width={800}
            title={T.translate("agents.libraries.edit_title")}
            visible={visible}
            onOk={onOk}
            onCancel={onCancel}
            footer={[
                agent ? false:
                <Button key="cancel" type="dashed" onClick={onCancel}>
                    {T.translate("common.button.cancel")}
                </Button>,
                agent ? false:
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
                uiSchema={ agent ? agentSchema : editTabFormSchema.uiSchema}
                widgets={formConfig.widgets}
                onChange={(e) => setEditingData(e.formData)}
                onSubmit={(e) => onOk(e)}
                onError={(e) => console.log(e)}>
                <></>
            </Form>
        </Modal>
    );
};

export default AgentLibraries;
