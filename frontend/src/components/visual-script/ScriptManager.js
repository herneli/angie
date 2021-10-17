import StatementBlock from "./statements/StatementBlock";
import StatementExpressionGroup from "./statements/StatementExpressionGroup";
import axios from "axios";

export default class ScriptManager {
    constructor({ context, language }) {
        this.context = context;
        this.language = language;
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

    newExpression() {
        return [this.context];
    }

    getLanguage() {
        return this.language;
    }

    getMembers(expression) {
        return axios
            .post("/script/object/members", {
                language: this.getLanguage(),
                type: expression[expression.length - 1].type,
            })
            .then((response) => response.data.data);
    }
}
