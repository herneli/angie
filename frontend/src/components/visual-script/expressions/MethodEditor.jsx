import React, { useEffect, useState } from "react";
import T from "i18n-react";
import { Modal } from "antd";
import Form from "@rjsf/antd";
import formConfig from "../../rjsf";

export default function MethodEditor({
    member,
    parentType,
    onParametersEntered,
    onCancel,
}) {
    const [formData, setFormData] = useState(null);
    useEffect(() => {
        if (member.paramDefinitions && member.paramDefinitions.length > 0) {
            let replacedParamDefinitions = replaceParamDefinitions();
            console.log("Param definitions", replacedParamDefinitions);
        } else {
            onParametersEntered({
                ...member,
                type: replaceType(member.type, parentType),
            });
        }
    }, [member]);
    const replaceType = (type, parentType) => {
        if (type.type === "$self") {
            return parentType;
        } else if (type.type === "$item") {
            return parentType.items;
        } else if (type.type === "array") {
            if (type.items.type === "$self") {
                return {
                    ...type,
                    items: parentType,
                };
            } else if (type.items.type === "$item") {
                return {
                    ...type,
                    items: parentType.items,
                };
            } else {
                return type;
            }
        } else {
            return type;
        }
    };
    const replaceParamDefinitions = () => {
        return member.paramDefinitions.map((paramDefinition) => {
            let type = replaceType(paramDefinition.type, parentType);
            return {
                ...paramDefinition,
                type,
            };
        });
    };

    if (!formData) {
        return <></>;
    }

    return (
        <Modal
            title={T.translate("visual-script.edit_method_parameters")}
            footer={null}
            visible={true}
            onCancel={onCancel}
        >
            <Form
                ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                widgets={formConfig.widgets}
                schema={formData.schema}
                uiSchema={formData.uiSchema}
            />
        </Modal>
    );
}
