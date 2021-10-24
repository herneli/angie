import React, { Component } from "react";
import { createUseStyles } from "react-jss";
import { useScriptContext } from "../../ScriptContext";
import Statement from "../Statement";
import StatementFinalPoint from "../StatementFinalPoint";
import LoopOptions from "./LoopOptions";
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
export default function StatementLoop({ statement, onChange }) {
    const { manager } = useScriptContext();
    const statementId = manager.getStatementDOMId(statement);
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
                        <LoopOptions id={statementId} />
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
