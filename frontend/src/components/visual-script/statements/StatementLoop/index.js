import StatementLoop from "./StatementLoop";
import T from "i18n-react";
import { mdiSync } from "@mdi/js";

const registry = {
    name: "visual_script.select_loop",
    iconPath: mdiSync,
    Component: StatementLoop,
    createConnections: (manager, statement) => {
        return manager.createConnectionsParallel(statement, true);
    },
    create: (manager) => {
        return {
            id: manager.newId(),
            type: "loop",
            name: T.translate("visual_script.new_loop"),
            arrayExpression: manager.newExpression(),
            itemVariable: "item",
            nestedStatements: [
                {
                    id: manager.newId(),
                    type: "block",
                    nestedStatements: [],
                },
            ],
        };
    },
    schema: (manager) => ({
        type: "object",
        properties: {
            name: { type: "string", title: "Comentario" },
        },
    }),
};

export default registry;
