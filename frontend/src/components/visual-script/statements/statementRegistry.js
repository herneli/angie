import blockRegistry from "./StatementBlock";
import commentRegistry from "./StatementComment";
import expressionGroupRegistry from "./StatementExpressionGroup";
import conditionRegistry from "./StatementCondition";
import loopRegistry from "./StatementLoop";

const statementRegistry = {
    block: blockRegistry,
    comment: commentRegistry,
    expressionGroup: expressionGroupRegistry,
    condition: conditionRegistry,
    loop: loopRegistry,
};

export default statementRegistry;
