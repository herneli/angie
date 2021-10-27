import React from "react";
import Expression from "../../expressions/Expression";
import { mdiDelete } from "@mdi/js";
import StatementIcon from "../StatementIcon";
import { Button } from "antd";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: { margin: "5px 0px" },
    deleteButton: { marginLeft: "15px" },
    icon: { color: "gray" },
});
export default function ExpressionWrapper({
    expression,
    variables,
    expectedType,
    onChange,
    onDelete,
}) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Expression
                expression={expression}
                variables={variables}
                expectedType={expectedType}
                onChange={onChange}
            />
            <Button
                className={classes.deleteButton}
                type="text"
                onClick={onDelete}
                icon={
                    <StatementIcon className={classes.icon} path={mdiDelete} />
                }
            />
        </div>
    );
}
