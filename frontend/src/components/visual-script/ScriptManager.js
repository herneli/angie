import StatementBlock from "./statements/StatementBlock";
import StatementExpressionGroup from "./statements/StatementExpressionGroup";

export default class ScriptManager {
    constructor() {
        this.statementRegistry = {
            block: {
                Component: StatementBlock,
            },
            expressionGroup: {
                Component: StatementExpressionGroup,
            },
        };
    }

    getStatementRegistry(type) {
        if (type in this.statementRegistry) {
            return this.statementRegistry[type];
        } else {
            throw Error("Statement " + type + " not found");
        }
    }

    getComponent(type) {
        const statementRegistry = this.getStatementRegistry(type);
        return statementRegistry.Component;
    }
}
