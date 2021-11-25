import React, { useState } from "react";
import { mdiCog, mdiContentCut, mdiPencil } from "@mdi/js";
import { Button, Dropdown, Menu } from "antd";
import { createUseStyles } from "react-jss";
import { useScriptContext } from "../ScriptContext";
import StatementIcon from "./StatementIcon";
import T from "i18n-react";
import StatementEditor from "./StatementEditor";
import Icon from "@mdi/react";

const useStyles = createUseStyles({
    root: {
        margin: "4px 4px",
        padding: "4px 10px",
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
        lineHeight: "24px",
        color: "gray",
    },
    icon: {
        color: "gray",
        marginRight: "10px",
        fontSize: 12,
        position: "relative",
        top: 4,
    },
    toolbar: {
        fontSize: 12,
        marginBottom: 2,
    },
    actions: {
        position: "absolute",
        right: 0,
        top: 0,
    },
    actionsIcon: {
        color: "gray",
    },
    menuIcon: {
        color: "gray",
        fontSize: "12px",
    },
});
export default function StatementBox({
    statement,
    variables,
    title,
    iconPath,
    children,
    hideDelete,
    customActions,
    onChange,
    onDelete,
    onCustomAction,
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

    const handleOnCustomAction = (code) => () => {
        onCustomAction(code);
    };
    const actions = (
        <Menu>
            {!hideDelete ? (
                <Menu.Item
                    key="0"
                    icon={<Icon className={classes.menuIcon} path={mdiContentCut} size="16px" />}
                    onClick={onDelete}>
                    {T.translate("visual_script.cut")}
                </Menu.Item>
            ) : null}
            <Menu.Item
                key="1"
                icon={<Icon className={classes.menuIcon} path={mdiPencil} size="16px" />}
                onClick={handleOnEdit}>
                {T.translate("visual_script.edit")}
            </Menu.Item>
            {customActions &&
                customActions.map((customAction) =>
                    !customAction.asButton ? (
                        <Menu.Item
                            key={customAction.code}
                            icon={<Icon className={classes.menuIcon} path={customAction.iconPath} size="16px" />}
                            onClick={handleOnCustomAction(customAction.code)}>
                            {customAction.text}
                        </Menu.Item>
                    ) : null
                )}
        </Menu>
    );
    return (
        <>
            <div id={statementId} className={classes.root}>
                <div className={classes.toolbar}>
                    <div>
                        <span className={classes.title}>
                            {iconPath ? <StatementIcon className={classes.icon} path={iconPath} /> : null}
                            <span className={classes.titleText}>{title || statement.name}</span>
                        </span>
                    </div>
                </div>
                <div className={classes.actions}>
                    {customActions &&
                        customActions.map((customAction) =>
                            customAction.asButton ? (
                                <Button
                                    key={customAction.code}
                                    type="text"
                                    icon={
                                        <StatementIcon className={classes.actionsIcon} path={customAction.iconPath} />
                                    }
                                    onClick={handleOnCustomAction(customAction.code)}
                                />
                            ) : null
                        )}
                    <Dropdown overlay={actions} trigger={["click"]}>
                        <Button type="text" icon={<StatementIcon className={classes.actionsIcon} path={mdiCog} />} />
                    </Dropdown>
                </div>
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
