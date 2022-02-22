import axios from "axios";
import React, { useRef } from "react";
import { useState } from "react";
import T from "i18n-react";
import { Button, message, Modal, notification } from "antd";
import ConditionalForm from "../../../components/rjsf/custom/ConditionalForm";

import formConfig from "../../../components/rjsf";

const formSchema = {
    schema: {
        type: "array",
        items: {
            type: "object",
            properties: {
                package_version: {
                    type: "string",
                    title: "Paquete",
                    pattern: "([^@]+)(@)([^s]+)s?",
                },
            },
        },
    },
    uiSchema: {
        items: {
            package_version: {
                "ui:placeholder": "package@version",
            },
        },
    },
};

export default function PackageVersionDependencies({ baseVersion, onOk, onCancel }) {
    const editTabFormEl = useRef(null);

    const parseTupleDependencies = (version) => {
        if (!version.dependencies) {
            return [];
        }
        return version.dependencies.map((el) => ({ package_version: el[0] + "@" + el[1] }));
    };
    const [dependencies, setDependencies] = useState(() => parseTupleDependencies(baseVersion));

    const handleSaveDependencies = async () => {
        const parsedDependencies = dependencies.map(({ package_version }) => package_version.split("@"));

        try {
            const response = await axios.post(
                `/packages/${baseVersion.code}/versions/${baseVersion.version}/dependencies`,
                parsedDependencies
            );

            if (response?.data?.success) {
                message.info(T.translate("packages.version_dependencies.saved_succesfully"));
                if (onOk) onOk();
            } else {
                notification.error({ message: T.translate("packages.version_dependencies.error_msg") });
            }
        } catch (error) {
            notification.error({ message: T.translate("packages.version_dependencies.error_msg") });
        }
    };

    return (
        <Modal
            visible={true}
            width={600}
            title={T.translate("packages.version_dependencies.title")}
            onCancel={onCancel}
            onOk={onOk}
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
            <ConditionalForm
                ref={editTabFormEl}
                ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                schema={formSchema.schema}
                formData={dependencies}
                uiSchema={formSchema.uiSchema}
                widgets={formConfig.widgets}
                onChange={(e) => setDependencies(e.formData)}
                onSubmit={(e) => handleSaveDependencies(e)}
                onError={(e) => console.log(e)}>
                <></>
            </ConditionalForm>
        </Modal>
    );
}
