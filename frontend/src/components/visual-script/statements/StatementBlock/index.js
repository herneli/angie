import StatementBlock from "./StatementBlock";
import T from "i18n-react";

const registry = {
    hidden: true,
    Component: StatementBlock,
    createConnections: (manager, statement) => {
        return manager.createConnectionsSequential(statement);
    },
    create: (manager) => {
        return {
            id: manager.newId(),
            type: "block",
            name: T.translate("visual_script.new_block"),
            nestedStatements: [],
            variables: {},
        };
    },
};

export default registry;
