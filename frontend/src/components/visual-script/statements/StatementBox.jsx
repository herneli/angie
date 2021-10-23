import Icon from "@mdi/react";
import React from "react";
import { createUseStyles } from "react-jss";
import { useScriptContext } from "../ScriptContext";
import StatementIcon from "./StatementIcon";

const useStyles = createUseStyles({
    root: {
        margin: "10px 10px",
        padding: "5px 15px",
        minWidth: 300,
        "&.all": {
            borderLeft: "3px solid dodgerblue",
        },
        "&.any": {
            borderLeft: "3px dashed dodgerblue",
        },
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
    icon: {
        color: "gray",
        marginRight: "10px",
        fontSize: 14,
        position: "relative",
        top: 4,
    },
    toolbar: {
        fontSize: 14,
        marginBottom: 10,
    },
});
export default function StatementBox({ statement, title, iconPath, children }) {
    const classes = useStyles();
    const { manager } = useScriptContext();
    const statementId = manager.getStatementDOMId(statement);
    return (
        <div id={statementId} className={classes.root}>
            <div className={classes.toolbar}>
                <div>
                    <span className={classes.title}>
                        {iconPath ? (
                            <StatementIcon
                                className={classes.icon}
                                path={iconPath}
                            />
                        ) : null}
                        <span className={classes.titleText}>
                            {title || statement.name}
                        </span>
                    </span>
                </div>
            </div>
            {children}
        </div>
    );
}
