import StatmentStart from "./StatmentStart";
import T from "i18n-react";
import { mdiPlay } from "@mdi/js";

export const registry = {
    name: "visual_script.select_start",
    hidden: true,
    iconPath: mdiPlay,
    Component: StatmentStart,
    create: (manager) => {
        return {
            id: manager.newId(),
            type: "start",
            name: T.translate("visual_script.start"),
        };
    },
    schema: (manager) => ({
        type: "object",
        properties: {
            variables: {
                title: "Variables",
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        code: { type: "string", title: "Código" },
                        name: { type: "string", title: "Nombre" },
                        type: { $ref: "#/definitions/type", title: "Tipo" },
                    },
                },
            },
        },
        definitions: {
            type: {
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        title: "Tipo",
                        enum: [
                            "array",
                            "boolean",
                            "date",
                            "number",
                            "integer",
                            "object",
                            "string",
                        ],
                        enumNames: [
                            "Lista",
                            "Boleano",
                            "Fecha",
                            "Decimal",
                            "Entero",
                            "Objeto",
                            "String",
                        ],
                        default: "",
                    },
                },
                dependencies: {
                    type: {
                        oneOf: [
                            {
                                properties: {
                                    type: {
                                        enum: [
                                            "boolean",
                                            "date",
                                            "number",
                                            "integer",
                                            "string",
                                        ],
                                    },
                                    selectOptions: {
                                        title: "Valores remotos",
                                        type: ["string", "null"],
                                    },
                                    widget: {
                                        title: "Editor",
                                        type: ["string", "null"],
                                    },
                                },
                            },
                            {
                                properties: {
                                    type: {
                                        enum: ["object"],
                                    },
                                    objectCode: {
                                        type: "string",
                                        title: "Código de objeto",
                                    },
                                },
                                selectOptions: {
                                    title: "Valores remotos",
                                    type: ["string", "null"],
                                },
                                widget: {
                                    title: "Editor",
                                    type: ["string", "null"],
                                },
                            },
                            {
                                properties: {
                                    type: {
                                        enum: ["array"],
                                    },
                                    items: {
                                        $ref: "#/definitions/type",
                                    },
                                },
                                widget: {
                                    title: "Editor",
                                    type: ["string", "null"],
                                },
                            },
                        ],
                    },
                },
            },
        },
    }),
    uiSchema: (manager) => ({
        variables: {
            "ui:options": {
                columns: [
                    { title: "Código", dataIndex: "code" },
                    { title: "Nombre", dataIndex: "name" },
                    { title: "Tipo", dataIndex: ["type", "type"] },
                    { title: "Objeto", dataIndex: ["type", "objectCode"] },
                ],
            },
            items: {
                code: { "ui:columnSize": "6" },
                name: { "ui:columnSize": "6" },
                type: {
                    "ui:withBorder": true,
                    "ui:columnSize": "12",
                    objectCode: {
                        "ui:widget": "SelectRemoteWidget",
                        "ui:selectOptions":
                            "/configuration/model/script_object/data#path=data&value=code&label=data.name",
                    },
                },
            },
        },
    }),
};

export default registry;
