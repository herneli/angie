import React, { useState } from "react";
import { mdiCog } from "@mdi/js";
import { Button, Dropdown, Menu } from "antd";
import { createUseStyles } from "react-jss";
import { useScriptContext } from "../ScriptContext";
import StatementIcon from "./StatementIcon";
import T from "i18n-react";
import StatementEditor from "./StatementEditor";

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
        position: "relative",
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
    actions: {
        position: "absolute",
        right: 0,
        top: 0,
    },
    actionsIcon: {
        color: "gray",
    },
});
export default function StatementBox({
    statement,
    variables,
    title,
    iconPath,
    children,
    hideActions,
    onChange,
    onDelete,
}) {
    const [editing, setEditing] = useState(false);
    const classes = useStyles();
    const { manager } = useScriptContext();
    const statementId = manager.getStatementDOMId(statement);
    const handleOnEdit = () => {
        setEditing(true);
    };
    const handleOnChange = (statement) => {
        setEditing(false);
        onChange(statement);
    };
    const handleCancelEdit = () => {
        setEditing(false);
    };
    const actions = (
        <Menu>
            <Menu.Item key="0">
                <Button type="link" onClick={onDelete}>
                    {T.translate("visual_script.cut")}
                </Button>
            </Menu.Item>
            <Menu.Item key="1">
                <Button type="link" onClick={handleOnEdit}>
                    {T.translate("visual_script.edit")}
                </Button>
            </Menu.Item>
        </Menu>
    );
    return (
        <>
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
                {!hideActions ? (
                    <div className={classes.actions}>
                        <Dropdown overlay={actions} trigger={["click"]}>
                            <Button
                                type="text"
                                icon={
                                    <StatementIcon
                                        className={classes.actionsIcon}
                                        path={mdiCog}
                                    />
                                }
                            />
                        </Dropdown>
                    </div>
                ) : null}
                {children}
            </div>
            {editing ? (
                <StatementEditor
                    statement={statement}
                    variables={variables}
                    onChange={handleOnChange}
                    onCancel={handleCancelEdit}
                />
            ) : null}
        </>
    );
}
