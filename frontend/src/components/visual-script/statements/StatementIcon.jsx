import React from "react";
import Icon from "@mdi/react";
import { createUseStyles } from "react-jss";

let useStyles = createUseStyles({
    icon: {
        fontSize: 14,
        position: "relative",
        top: 4,
    },
});
export default function StatementIcon({ path, className }) {
    const classes = useStyles();
    return <Icon className={classes.icon + " " + className} path={path} size={"18px"} />;
}
