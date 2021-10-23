import React from "react";
import { createUseStyles } from "react-jss";
import { useScriptContext } from "../ScriptContext";
const useStyles = createUseStyles({
    root: {
        height: "1px",
        width: "1px",
        display: "inline-block",
        position: "relative",
        backgroundColor: "#aaa",
    },
});
export default function StatementFinalPoint({ statement }) {
    const { manager } = useScriptContext();
    const classes = useStyles();

    const statementId = manager.getStatementDOMId(statement);

    return <div id={statementId + "-final"} className={classes.root} />;
}
