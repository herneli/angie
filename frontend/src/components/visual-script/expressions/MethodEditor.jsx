import React, { useEffect, useState } from "react";
import T from "i18n-react";
import { Button, Modal, Space } from "antd";
import Form from "@rjsf/antd";
import formConfig from "../../rjsf";
import { useScriptContext } from "../ScriptContext";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    formFooter: {
        display: "flex",
        justifyContent: "right",
        marginTop: "20px",
    },
});
export default function MethodEditor({
    member,
    onParametersEntered,
    onCancel,
}) {
    const [formOptions, setFormOptions] = useState(null);
    const { manager } = useScriptContext();
    const classes = useStyles();

    useEffect(() => {
        if (member.paramMembers && member.paramMembers.length > 0) {
            let newFormOptions = {
                schema: {
                    type: "object",
                    properties: {},
                },
                uiSchema: {
                    "ui:withBorder": true,
                },
            };
            let paramConfigPromises = member.paramMembers.map((paramMember) => {
                return memberToFormSchemas(paramMember);
            });
            Promise.all(paramConfigPromises).then((paramConfigs) => {
                paramConfigs.forEach((paramConfig) => {
                    newFormOptions.schema.properties[paramConfig.member.code] =
                        paramConfig.schema;
                    newFormOptions.uiSchema[paramConfig.member.code] =
                        paramConfig.uiSchema;
                });
                setFormOptions(newFormOptions);
            });
        } else {
            onParametersEntered(member);
        }
    }, [member]);

    const handleOnSubmit = (f) => {
        onParametersEntered({ ...member, params: f.formData });
    };

    const handleCancel = () => {
        onCancel();
    };

    const memberToFormSchemas = async (member) => {
        return {
            member,
            schema: await memberToSchema(member),
            uiSchema: memberToUiSchema(member),
        };
    };

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

    const memberToUiSchema = (member) => {
        let uiSchema = {};
        if (member.type.selectOptions) {
            if (member.type.type === "array") {
                uiSchema.items = {
                    "ui:widget": "SelectRemoteWidget",
                    "ui:remoteValues": member.type.selectOptions,
                };
            } else {
                uiSchema = {
                    "ui:widget": "SelectRemoteWidget",
                    "ui:selectOptions": member.type.selectOptions,
                };
            }
        }
        if (member.type.type === "integer" || member.type.type === "number") {
            uiSchema["ui:emptyValue"] = 0;
        }
        if (member.type.widget) {
            uiSchema["ui:widget"] = member.type.widget;
        }
        return uiSchema;
    };

    const memberToSchema = async (member) => {
        switch (member.type.type) {
            case "string":
                return {
                    type: "string",
                    title: member.name,
                };
            case "date":
                return {
                    type: "string",
                    format: "date",
                    title: member.name,
                    default: "",
                };
            case "integer":
                return {
                    type: "integer",
                    title: member.name,
                    default: 0,
                };

            case "number":
                return {
                    type: "number",
                    title: member.name,
                    default: 0,
                };
            case "boolean":
                return {
                    type: "boolean",
                    title: member.name,
                    default: false,
                };
            case "array":
                return {
                    type: "array",
                    title: member.name,
                    default: [],
                    items: await memberToSchema({ type: member.items }),
                };
            case "object":
                let members = await manager.getMembers(member.type, {
                    excludeMethods: true,
                });
                let returnObject = {
                    type: "object",
                    title: member.name,
                    properties: {},
                    // required: [],
                };
                members.properties.forEach(async (childMember) => {
                    returnObject.properties[childMember.code] =
                        await memberToSchema(childMember);
                });
                return returnObject;
            default:
                throw Error("Type member not supported: ", member.type.type);
        }
    };

    if (!formOptions) {
        return <></>;
    }

    console.log(formOptions);

    return (
        <Modal
            title={T.translate("visual_script.edit_method_parameters", {
                method: member.name,
            })}
            footer={null}
            visible={true}
            onCancel={onCancel}
        >
            <div>
                <Form
                    ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                    ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                    widgets={formConfig.widgets}
                    schema={formOptions.schema}
                    uiSchema={formOptions.uiSchema}
                    onSubmit={handleOnSubmit}
                    formData={member.params}
                >
                    <div className={classes.formFooter}>
                        <Space>
                            <Button onClick={handleCancel}>
                                {T.translate("visual_script.cancel")}
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {T.translate("visual_script.accept")}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
