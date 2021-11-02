import React from "react";
import RuleExpression from "./RuleExpression";
import RuleGroup from "./RuleGroup";

export default function Rule({ id, rule, variables, onChange, onDelete }) {
    if (rule.type === "group") {
        return (
            <RuleGroup
                id={id}
                rule={rule}
                variables={variables}
                onChange={onChange}
                onDelete={onDelete}
            />
        );
    } else if (rule.type === "expression") {
        return (
            <RuleExpression
                rule={rule}
                variables={variables}
                onChange={onChange}
                onDelete={onDelete}
            />
        );
    } else {
        throw new Error("Incorrect rule type");
    }
}
