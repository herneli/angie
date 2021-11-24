import React, { useEffect, useState } from "react";
import T from "i18n-react";
import { Button, Modal, Space } from "antd";

import { useScriptContext } from "../ScriptContext";
import { createUseStyles } from "react-jss";
import ScriptForm from "../rjsf/ScriptForm";
import convertToExpressionSchema from "./convertToExpressionSchema";
import getMembers from "../getMembers";

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
                    member.params[paramMember.code] = null;
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
            schema: await memberToSchema(member, parentMember),
            uiSchema: memberToUiSchema(member, parentMember),
        };
    };

    const memberToUiSchema = (member, parentMember) => {
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
        if (member.options) {
            member.options.forEach((option) => {
                if (!uiSchema["ui:paramOptions"]) {
                    uiSchema["ui:paramOptions"] = {};
                }
                uiSchema["ui:paramOptions"][option.code] = option;
            });
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
                    items: await memberToSchema({ type: member.type.items }),
                };
            case "object":
                let members = await getMembers(manager.getLanguage(), member.type, {
                    excludeMethods: true,
                });
                let returnObject = {
                    type: "object",
                    title: member.name,
                    properties: {},
                };
                members.properties.forEach(async (childMember) => {
                    returnObject.properties[childMember.code] = await memberToSchema(childMember);
                });
                return returnObject;
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
