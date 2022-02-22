import axios from "axios";
import React, { useRef } from "react";
import { useState } from "react";
import T from "i18n-react";
import { Button, message, Modal, notification } from "antd";
import ConditionalForm from "../../../components/rjsf/custom/ConditionalForm";

import formConfig from "../../../components/rjsf";

const formSchema = {
    schema: {
        type: "object",
        properties: {
            dependencies: {
                type: "array",
                items: {
                    type: "string",
                    enum: [],
                },
                uniqueItems: true,
            },
        },
    },
    uiSchema: {
        dependencies: {
            "ui:columnSize": "12",
            "ui:widget": "SelectRemoteWidget",
            "ui:mode": "multiple",
            "ui:selectOptions": "/packages/all/versions#path=data&value=abbreviation&label=abbreviation",
        },
    },
};

export default function PackageVersionDependencies({ baseVersion, onOk, onCancel }) {
    const editTabFormEl = useRef(null);

    const parseTupleDependencies = (version) => {
        if (!version.dependencies) {
            return [];
        }
        return version.dependencies.map((el) => el[0] + "@" + el[1]);
    };
    const [dependencies, setDependencies] = useState(() => parseTupleDependencies(baseVersion));

    const handleSaveDependencies = async () => {
        const parsedDependencies = dependencies.map((el) => el.split("@"));

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
                formData={{ dependencies }}
                uiSchema={formSchema.uiSchema}
                widgets={formConfig.widgets}
                onChange={(e) => setDependencies(e.formData.dependencies)}
                onSubmit={(e) => handleSaveDependencies(e)}
                onError={(e) => console.log(e)}>
                <></>
            </ConditionalForm>
        </Modal>
    );
}
