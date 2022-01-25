import React, { useEffect, useState } from "react";
import T from "i18n-react";
import { Button, Modal, Space } from "antd";

import { useScriptContext } from "../ScriptContext";
import { createUseStyles } from "react-jss";
import ScriptForm from "../rjsf/ScriptForm";
import convertToExpressionSchema from "./convertToExpressionSchema";
import getMembers from "../getMembers";
import { usePackage } from "../../packages/PackageContext";

const useStyles = createUseStyles({
    formFooter: {
        display: "flex",
        justifyContent: "right",
        marginTop: "20px",
    },
});

export default function MethodEditor({ member, variables, onParametersEntered, onCancel }) {
    const [formOptions, setFormOptions] = useState(null);
    const { manager } = useScriptContext();
    const classes = useStyles();
    const packageData = usePackage();

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
            if (!member.params) {
                member.params = {};
            }
            let paramConfigPromises = member.paramMembers.map((paramMember) => {
                if (!(paramMember.code in member.params)) {
                    member.params[paramMember.code] = getDefaultByType(paramMember.type);
                }
                return memberToFormSchemas(paramMember, member);
            });
            Promise.all(paramConfigPromises).then((paramConfigs) => {
                paramConfigs.forEach((paramConfig) => {
                    newFormOptions.schema.properties[paramConfig.member.code] = paramConfig.schema;
                    newFormOptions.uiSchema[paramConfig.member.code] = paramConfig.uiSchema;
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

    const memberToFormSchemas = async (member, parentMember) => {
        return {
            member,
            schema: await memberToSchema(member, {}),
            uiSchema: memberToUiSchema(member),
        };
    };

    const memberToUiSchema = (member) => {
        let uiSchema = {};
        if (member.type.selectOptions) {
            if (member.type.type === "array") {
                uiSchema.items = {
                    "ui:widget": "SelectRemoteWidget",
                    "ui:selectOptions": member.type.selectOptions,
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
        if (member.options) {
            member.options.forEach((option) => {
                if (!uiSchema["ui:options"]) {
                    uiSchema["ui:options"] = {};
                }
                uiSchema["ui:options"][option.code] = option.value;
            });
        }
        return uiSchema;
    };

    const memberToSchema = async (member, childrenObjects) => {
        let objectProperties = [];
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
                    default: true,
                };
            case "array":
                return {
                    type: "array",
                    title: member.name,
                    default: [],
                    items: await memberToSchema({ type: member.type.items }, childrenObjects),
                };
            case "object":
                if (member.type.objectCode in childrenObjects) {
                    objectProperties = childrenObjects[member.type.objectCode];
                } else {
                    let members = await getMembers(manager.getLanguage(), member.type, {
                        excludeMethods: true,
                        recursive: true,
                        packages: packageData.dependencies,
                    });
                    objectProperties = members.properties;
                    childrenObjects = { ...childrenObjects, ...members.childrenObjects };
                }

                let returnObject = {
                    type: "object",
                    title: member.name,
                    properties: {},
                };
                objectProperties.forEach(async (childMember) => {
                    returnObject.properties[childMember.code] = await memberToSchema(childMember, childrenObjects);
                });

                return returnObject;
            case "$any":
            case "$anyPrimitive":
                return {
                    type: "string",
                    title: member.name,
                };
            case "$anyObject":
                return {
                    type: "object",
                    title: member.name,
                    properties: {},
                };

            default:
                throw Error("Type member not supported: ", member.type.type);
        }
    };

    const getDefaultByType = (type) => {
        switch (type.type) {
            case "string":
            case "date":
                return "";
            case "integer":
            case "number":
                return 0;
            case "boolean":
                return false;
            case "array":
                return [];
            case "object":
                return {};
            case "$any":
            case "$anyPrimitive":
                return "";
            case "$anyObject":
                return {};

            default:
                throw Error("Type member not supported: ", member.type.type);
        }
    };

    if (!formOptions) {
        return <></>;
    }

    const { schema: expSchema, uiSchema: expUiSchema } = convertToExpressionSchema(
        formOptions.schema,
        formOptions.uiSchema,
        variables
    );

    return (
        <Modal
            title={T.translate("visual_script.edit_method_parameters", {
                method: member.name,
            })}
            footer={null}
            visible={true}
            onCancel={onCancel}
            width={1000}>
            <div>
                <ScriptForm
                    schema={expSchema}
                    uiSchema={expUiSchema}
                    onSubmit={handleOnSubmit}
                    formData={member.params}>
                    <div className={classes.formFooter}>
                        <Space>
                            <Button onClick={handleCancel}>{T.translate("visual_script.cancel")}</Button>
                            <Button type="primary" htmlType="submit">
                                {T.translate("visual_script.accept")}
                            </Button>
                        </Space>
                    </div>
                </ScriptForm>
            </div>
        </Modal>
    );
}
