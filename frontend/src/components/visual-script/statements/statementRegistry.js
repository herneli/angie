import blockRegistry from "./StatementBlock";
import commentRegistry from "./StatementComment";
import expressionGroupRegistry from "./StatementExpressionGroup";
import conditionRegistry from "./StatementCondition";
import loopRegistry from "./StatementLoop";
import startRegistry from "./StatementStart";
import endRegistry from "./StatementEnd";

const statementRegistry = {
    block: blockRegistry,
    comment: commentRegistry,
    expressionGroup: expressionGroupRegistry,
    condition: conditionRegistry,
    loop: loopRegistry,
    start: startRegistry,
    end: endRegistry,
};

export default statementRegistry;
