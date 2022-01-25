import StatementCondition from "./StatementCondition";
import T from "i18n-react";
import { mdiHelpRhombusOutline } from "@mdi/js";

const registry = {
    name: "visual_script.select_condition",
    iconPath: mdiHelpRhombusOutline,
    Component: StatementCondition,
    createConnections: (manager, statement) => {
        return manager.createConnectionsParallel(statement);
    },
    create: (manager) => {
        return {
            id: manager.newId(),
            type: "condition",
            name: T.translate("visual_script.new_condition"),
            rule: {
                type: "group",
                combinator: "all",
                rules: [],
            },
            nestedStatements: [
                {
                    id: manager.newId(),
                    type: "block",
                    label: T.translate("visual_script.condition_yes"),
                    code: "true",
                    nestedStatements: [],
                },
                {
                    id: manager.newId(),
                    type: "block",
                    label: T.translate("visual_script.condition_no"),
                    code: "false",
                    nestedStatements: [],
                },
            ],
        };
    },
    schema: () => ({
        type: "object",
        properties: {
            name: { type: "string", title: "Comentario" },
            nestedStatements: {
                title: "Opciones",
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        label: { type: "string", title: "Etiqueta" },
                    },
                },
            },
        },
    }),
    uiSchema: () => ({
        nestedStatements: {
            "ui:options": {
                addable: false,
                removable: false,
            },
        },
    }),
};

export default registry;
