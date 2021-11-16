import React, { useEffect, useRef, useState } from "react";

import Form from "@rjsf/antd";
import lodash from "lodash";
import axios from "axios";

import { Button, Modal } from "antd";

import T from "i18n-react";
import formConfig from "../../../components/rjsf";

const Sidebar = ({ selectedType, onNodeUpdate, editNodeVisible, onEditCancel }) => {
    const formEl = useRef(null);
    const [formData, setFormData] = useState(null);
    const [formSchema, setFormSchema] = useState(null);
    const [uiSchema, setUiSchema] = useState(null);
    const [nodeTypes, setNodeTypes] = useState([]);

    const onDragStart = (event, nodeType, extra) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.setData("application/reactflow/extra", JSON.stringify(extra));
        event.dataTransfer.effectAllowed = "move";
    };

    useEffect(() => {
        loadNodeTypes();
    }, []);

    useEffect(() => {
        if (selectedType && selectedType.data) {
            const type = lodash.find(nodeTypes, {
                id: selectedType.data.type_id,
            });
            setFormData(lodash.omit(selectedType.data, ["type_id"]));
            try {
                setFormSchema(type.data && JSON.parse(type.data.json_data_schema));
            } catch (ex) {
                console.error(ex);
                setFormSchema({});
            }
            try {
                setUiSchema(type.data && JSON.parse(type.data.json_ui_schema));
            } catch (ex) {
                console.error(ex);
                setUiSchema({});
            }
        }
    }, [selectedType, selectedType.data, selectedType.position]);

    const loadNodeTypes = async () => {
        const response = await axios.get("/configuration/model/node_type/data");

        if (response?.data?.success) {
            setNodeTypes(response?.data?.data);
        } else {
            console.error(response.data);
        }
    };

    const onFormSubmit = () => {
        if (selectedType && selectedType.data && onNodeUpdate) {
            onNodeUpdate(null, {
                ...selectedType,
                data: { ...selectedType.data, ...formData },
            });
        }
    };

    const modalOk = () => {
        onFormSubmit();
    };

    const modalCancel = () => {
        onEditCancel();
    };

    const drawGroupedTypes = (types) => {
        const sorted = lodash.sortBy(types, "data.group");
        const grouped = sorted && sorted.length !== 0 ? lodash.groupBy(sorted, "data.group") : {};

        let result = [];
        for (const group in grouped) {
            let child = grouped[group];

            result.push(
                <div key={group}>
                    <span>{group}</span>
                    <hr />
                    {child.map((type) => (
                        <div
                            key={type.id}
                            className={"dndnode " + type.data.react_component_type}
                            onDragStart={(event) =>
                                onDragStart(event, type.data.react_component_type, {
                                    label: type.data.name,
                                    type_id: type.id,
                                    ...JSON.parse(type.data.defaults),
                                })
                            }
                            draggable>
                            {type.data.name}
                        </div>
                    ))}
                </div>
            );
        }

        return result;
    };

    return (
        <aside>
            <div className="description">{T.translate("integrations.channel.sidebar.title")}</div>

            {drawGroupedTypes(nodeTypes)}

            <Modal
                width={800}
                title={T.translate("integrations.channel.node.settings_title", selectedType && selectedType.data)}
                visible={editNodeVisible}
                onOk={modalOk}
                onCancel={modalCancel}
                footer={[
                    <Button key="cancel" type="dashed" onClick={() => modalCancel()}>
                        {T.translate("common.button.cancel")}
                    </Button>,
                    <Button
                        key="accept"
                        type="primary"
                        onClick={(e) => {
                            //Forzar el submit del FORM simulando el evento
                            formEl.current.onSubmit({
                                target: null,
                                currentTarget: null,
                                preventDefault: () => true,
                                persist: () => true,
                            });
                        }}>
                        {T.translate("common.button.accept")}
                    </Button>,
                ]}>
                {formSchema && formData && (
                    <Form
                        ref={formEl}
                        ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                        ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                        schema={formSchema}
                        formData={formData}
                        uiSchema={uiSchema}
                        widgets={formConfig.widgets}
                        onChange={(e) => setFormData(e.formData)}
                        onSubmit={() => onFormSubmit()}
                        onError={(e) => console.log(e)}>
                        <></>
                    </Form>
                )}
            </Modal>
        </aside>
    );
};
export default Sidebar;
