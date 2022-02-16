import { Button, Modal, Select, Tag } from "antd";

import lodash from "lodash";
import { useEffect, useRef, useState } from "react";

import formConfig from "../../../components/rjsf";

import T from "i18n-react";
import ConditionalForm from "../../../components/rjsf/custom/ConditionalForm";
import * as api from "../../../api/configurationApi";

export default function NodeEditModal({
    children,
    selectedType,
    editNodeVisible,
    onNodeEditEnd,
    onEditCancel,
    nodeTypes,
    onDataChange,
}) {
    const formEl = useRef(null);
    const [formData, setFormData] = useState({});
    const [tags, setTags] = useState([]);

    useEffect(() => {
        loadTags();
    }, []);

    /**
     * Se ejecuta cuando cambia la selección y carga en el state las propiedades del nodo actual
     */
    useEffect(() => {
        if (selectedType && editNodeVisible) {
            const type = lodash.find(nodeTypes, (el) => {
                let result = el.id === selectedType.type_id || el.code === selectedType.type_id;
                if (!result && el.alt_codes) {
                    const splitted = el.alt_codes.split(",");
                    result = splitted.indexOf(selectedType.type_id) !== -1;
                }
                return result;
            });
            let jsonSchema = {};
            try {
                jsonSchema = type && JSON.parse(type.json_data_schema);
            } catch (ex) {
                console.error(ex);
            }
            let uiSchema = {};
            try {
                uiSchema = type && JSON.parse(type.json_ui_schema);
            } catch (ex) {
                console.error(ex);
            }
            setFormData({
                data: {
                    label: selectedType.custom_name,
                    ...selectedType.data,
                },
                schema: jsonSchema,
                uiSchema: uiSchema,
            });
        }
    }, [editNodeVisible]);

    /**
     * Actualiza el nodo con las nuevas propiedades
     */
    const onFormSubmit = () => {
        if (selectedType) {
            onNodeEditEnd(selectedType.id, {
                ...selectedType,
                data: { ...formData.data },
            });
        }
    };

    /**
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadTags = async () => {
        try {
            const tags = await api.getModelDataList("tag");
            setTags(tags);
        } catch (ex) {
            console.error(ex);
        }
    };

    return (
        <Modal
            width={"70vw"}
            title={
                <div>
                    {T.translate("integrations.channel.node.settings_title", selectedType && selectedType.data)}
                    {formData && formData.data && (
                        // <AddableTags
                        //     style={{ float: "right", marginRight: 40 }}
                        //     addButtonText="Etiquetas"
                        //     initialTags={formData.data.tags}
                        //     onChange={(tags) => {
                        //         let newFormData = { ...formData };
                        //         newFormData.data.tags = tags;
                        //         setFormData(newFormData);
                        //         if (onDataChange) onDataChange(newFormData);
                        //     }}
                        // />

                        <Select
                            mode="multiple"
                            showArrow
                            style={{ float: "right", marginRight: 40, width: 350 }}
                            placeholder="Etiquetas"
                            value={formData.data.tags}
                            onChange={(tags) => {
                                let newFormData = { ...formData };
                                newFormData.data.tags = tags;
                                setFormData(newFormData);
                                if (onDataChange) onDataChange(newFormData);
                            }}
                            options={lodash.map(tags, (tag) => ({ value: tag.code, label: tag.name }))}
                        />
                    )}
                </div>
            }
            visible={editNodeVisible}
            onOk={onFormSubmit}
            onCancel={onEditCancel}
            destroyOnClose={true}
            footer={[
                <Button key="cancel" type="dashed" onClick={() => onEditCancel()}>
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
            {editNodeVisible && formData && formData.data && (
                <div>
                    <ConditionalForm
                        ref={formEl}
                        ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                        ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                        schema={formData.schema}
                        formData={formData.data}
                        uiSchema={formData.uiSchema}
                        liveOmit={formData?.schema?.liveOmit || false}
                        omitExtraData={formData?.schema?.omitExtraData || false}
                        widgets={formConfig.widgets}
                        fields={formConfig.fields}
                        onChange={(e) => {
                            setFormData({ ...formData, data: e.formData });
                            if (onDataChange) onDataChange(e.formData);
                        }}
                        onSubmit={() => onFormSubmit()}
                        onError={(e) => console.log(e)}>
                        <></>
                    </ConditionalForm>
                </div>
            )}
            {children}
        </Modal>
    );
}
