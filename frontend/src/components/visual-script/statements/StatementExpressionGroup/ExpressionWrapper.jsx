import React from "react";
import Expression from "../../expressions/Expression";
import { mdiDelete, mdiDrag, mdiDragVertical } from "@mdi/js";
import StatementIcon from "../StatementIcon";
import { Button } from "antd";
import { createUseStyles } from "react-jss";
import Icon from "@mdi/react";
import ExpressionMember from "../../expressions/ExpressionMember";

const useStyles = createUseStyles({
    root: { margin: "5px 0px" },
    deleteButton: { marginLeft: "15px" },
    icon: { color: "gray" },
});
export default function ExpressionWrapper({ expression, variables, expectedType, onChange, onDelete }) {
    const classes = useStyles();
    return (
        <div className={classes.root + " drag-item"}>
            <span className="drag-handle">
                <Icon path={mdiDragVertical} size="14px" />
            </span>
            <Expression expression={expression} variables={variables} expectedType={expectedType} onChange={onChange} />
            <Button
                className={classes.deleteButton}
                type="text"
                onClick={onDelete}
                icon={<StatementIcon className={classes.icon} path={mdiDelete} />}
            />
        </div>
    );
}
