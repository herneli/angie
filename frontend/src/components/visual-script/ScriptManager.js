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

    getMembers(type, options) {
        return axios
            .post("/script/object/members", {
                language: this.getLanguage(),
                type: type,
                ...options,
            })
            .then((response) => response.data.data);
    }
}
