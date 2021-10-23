import StatementCondition from "./StatementCondition";
import T from "i18n-react";
import { mdiHelpRhombus } from "@mdi/js";

const registry = {
    name: "visual_script.select_condition",
    iconPath: mdiHelpRhombus,
    Component: StatementCondition,
    createConnections: (manager, statement) => {
        return manager.createConnectionsParallel(statement);
    },
    create: (manager) => {
        return {
            id: manager.newId(),
            type: "condition",
            name: T.translate("visual_script.new_condition"),
            nestedStatements: [
                {
                    id: manager.newId(),
                    type: "block",
                    label: T.translate("visual_script.condition_yes"),
                    nestedStatements: [],
                },
                {
                    id: manager.newId(),
                    type: "block",
                    label: T.translate("visual_script.condition_no"),
                    nestedStatements: [],
                },
            ],
        };
    },
};

export default registry;
