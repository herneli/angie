import React from "react";
import { useScriptContext } from "../ScriptContext";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    label: {
        backgroundColor: "#b1b0b0",
        color: "#ffffff",
        borderRadius: "4px",
        padding: "4px 10px",
        fontSize: "12px",
        display: "inline-block",
        zIndex: 1,
        marginTop: "12px",
    },
    noLabel: {
        backgroundColor: "#b1b0b0",
        height: "2px",
        width: "2px",
        display: "inline-block",
    },
});
export default function StatementLabel({ statement }) {
    const { manager } = useScriptContext();
    const classes = useStyles();
    const statementId = manager.getStatementDOMId(statement);

    if (statement.label) {
        return (
            <div id={statementId + "-label"} className={classes.label}>
                {statement.label}
            </div>
        );
    } else {
        return <div id={statementId + "-label"} className={classes.noLabel} />;
    }
}
