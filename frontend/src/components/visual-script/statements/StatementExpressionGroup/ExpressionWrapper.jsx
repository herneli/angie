import React from "react";
import Expression from "../../expressions/Expression";
import { mdiDelete } from "@mdi/js";
import StatementIcon from "../StatementIcon";
import { Button } from "antd";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: { margin: "15px 0px" },
    actions: { marginLeft: "20px" },
    icon: { color: "rgba(0, 0, 0, 0.54);" },
});
export default function ExpressionWrapper({ expression, onChange, onDelete }) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Expression expression={expression} onChange={onChange} />
            <span className={classes.actions}>
                <Button
                    type="text"
                    onClick={onDelete}
                    icon={
                        <StatementIcon
                            className={classes.icon}
                            path={mdiDelete}
                        />
                    }
                />
            </span>
        </div>
    );
}
