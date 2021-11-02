import React from "react";
import StatementBox from "../StatementBox";
import registry from ".";

export default function StatementComment({
    statement,
    variables,
    onChange,
    onDelete,
}) {
    return (
        <StatementBox
            statement={statement}
            variables={variables}
            title={statement.comment}
            iconPath={registry.iconPath}
            onChange={onChange}
            onDelete={onDelete}
        ></StatementBox>
    );
}
