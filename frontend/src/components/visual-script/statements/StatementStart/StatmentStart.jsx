import React from "react";
import StatementBox from "../StatementBox";
import registry from ".";
import T from "i18n-react";
export default function StatementStart({ statement, variables, onChange }) {
    return (
        <StatementBox
            statement={statement}
            variables={variables}
            title={statement.name}
            iconPath={registry.iconPath}
            hideDelete={true}
            onChange={onChange}
        ></StatementBox>
    );
}
