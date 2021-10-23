import blockRegistry from "./StatementBlock";
import commentRegistry from "./StatementComment";
import expressionGroupRegistry from "./StatementExpressionGroup";
import conditionRegistry from "./StatementCondition";

const statementRegistry = {
    block: blockRegistry,
    comment: commentRegistry,
    expressionGroup: expressionGroupRegistry,
    condition: conditionRegistry,
};

export default statementRegistry;
