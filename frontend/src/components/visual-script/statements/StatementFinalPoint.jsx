import React from "react";
import { createUseStyles } from "react-jss";
import { useScriptContext } from "../ScriptContext";
import loopBackIcon from "../statements/StatementLoop/loop_back.png";
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
    if (statement.type === "loop") {
        return (
            <img
                id={statementId + "-final"}
                src={loopBackIcon}
                alt="loop back"
            />
        );
    } else {
        return <div id={statementId + "-final"} className={classes.root} />;
    }
}
