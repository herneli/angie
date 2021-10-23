import React from "react";
import { useScriptContext } from "../../ScriptContext";
import { createUseStyles } from "react-jss";
import Statement from "../Statement";
import StatementBox from "../StatementBox";
import StatementFinalPoint from "../StatementFinalPoint";
import registry from ".";

const useStyles = createUseStyles({
    table: {
        borderCollapse: "separate",
        borderSpacing: "0px",
        display: "inline-block",
        "& td": {
            verticalAlign: "top",
        },
    },
});

export default function StatementCondition({
    statement,
    variables,
    onChange,
    onDelete,
}) {
    const { manager } = useScriptContext();
    const classes = useStyles();

    const handleOnChange = (index) => (childStatement) => {
        let newNestedStatements = [
            ...statement.nestedStatements.slice(0, index),
            childStatement,
            ...statement.nestedStatements.slice(index + 1),
        ];
        onChange &&
            onChange({ ...statement, nestedStatements: newNestedStatements });
    };
    const statementId = manager.getStatementDOMId(statement);
    const renderNestedStatements = () => {
        return statement.nestedStatements.map((childStatement, index) => {
            return (
                <td key={childStatement.id}>
                    <Statement
                        statement={childStatement}
                        onChange={handleOnChange(index)}
                    />
                </td>
            );
        });
    };
    return (
        <table className={classes.table}>
            <tbody>
                <tr>
                    <td id={statementId + "-loop-back"}>
                        <StatementBox
                            statement={statement}
                            iconPath={registry.iconPath}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <table className={classes.table}>
                            <tbody>
                                <tr>{renderNestedStatements()}</tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <StatementFinalPoint statement={statement} />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
