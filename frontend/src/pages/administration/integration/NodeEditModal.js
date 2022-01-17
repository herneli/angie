import { Button, Modal } from "antd";

import lodash from "lodash";
import { useEffect, useRef, useState } from "react";
import Form from "@rjsf/antd";

import formConfig from "../../../components/rjsf";

import T from "i18n-react";
import ConditionalForm from "../../../components/rjsf/custom/ConditionalForm";

export default function NodeEditModal({ selectedType, editNodeVisible, onNodeEditEnd, onEditCancel, nodeTypes }) {
    const formEl = useRef(null);
    const [formData, setFormData] = useState({});

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
    return (
        <Modal
            width={"80vw"}
            title={T.translate("integrations.channel.node.settings_title", selectedType && selectedType.data)}
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
                    onChange={(e) => setFormData({ ...formData, data: e.formData })}
                    onSubmit={() => onFormSubmit()}
                    onError={(e) => console.log(e)}>
                    <></>
                </ConditionalForm>
            )}
        </Modal>
    );
}
