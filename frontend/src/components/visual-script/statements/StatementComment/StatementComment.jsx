import React from "react";
import { createUseStyles } from "react-jss";
import { useScriptContext } from "../../ScriptContext";
import StatementBox from "../StatementBox";
import registry from ".";

const useStyles = createUseStyles({
    root: {
        margin: "10px 10px",
        padding: "5px 15px",
        minWidth: 450,

        borderRadius: 0,
        background: "rgba(158, 158, 158, 0.15)",
        textAlign: "left",
        boxShadow: "0 0 2px rgba(0, 0, 0, 0), 0 2px 4px rgba(0, 0, 0, 0.33)",
        display: "inline-block",
    },
    title: {
        display: "inline-block",
        lineHeight: "32px",
        color: "gray",
    },
});
export default function StatementComment({ statement }) {
    const classes = useStyles();
    const { manager } = useScriptContext();
    return (
        <StatementBox
            statement={statement}
            title={statement.comment}
            iconPath={registry.iconPath}
        ></StatementBox>
    );
}
