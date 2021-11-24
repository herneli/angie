import React from "react";
import Expression from "../../expressions/Expression";
import { mdiContentCopy, mdiDelete, mdiDrag, mdiDragVertical } from "@mdi/js";
import StatementIcon from "../StatementIcon";
import { Button, Popconfirm } from "antd";
import { createUseStyles } from "react-jss";
import Icon from "@mdi/react";
import T from "i18n-react";

const useStyles = createUseStyles({
    root: { margin: "5px 0px" },
    button: {},
    icon: { color: "gray" },
});
export default function ExpressionWrapper({ expression, variables, expectedType, onChange, onDelete, onDuplicate }) {
    const classes = useStyles();
    return (
        <div className={classes.root + " drag-item"}>
            <span className="drag-handle">
                <Icon path={mdiDragVertical} size="14px" />
            </span>
            <Expression expression={expression} variables={variables} expectedType={expectedType} onChange={onChange} />
            <Button
                className={classes.button}
                type="text"
                onClick={onDuplicate}
                icon={<StatementIcon className={classes.icon} path={mdiContentCopy} />}
            />
            <Popconfirm title={T.translate("visual_script.confirm_delete")} onConfirm={onDelete}>
                <Button
                    className={classes.button}
                    type="text"
                    icon={<StatementIcon className={classes.icon} path={mdiDelete} />}
                />
            </Popconfirm>
        </div>
    );
}
