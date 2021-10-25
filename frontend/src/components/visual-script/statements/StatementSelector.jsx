import { List, Popover } from "antd";
import React, { useState } from "react";
import { useScriptContext } from "../ScriptContext";
import { createUseStyles } from "react-jss";
import Icon from "@mdi/react";
import T from "i18n-react";
import { mdiClipboardOutline } from "@mdi/js";

const useStyles = createUseStyles({
    selector: {
        minWidth: "300px",
        maxHeight: "300px",
        overflow: "auto",
    },
    listItem: {
        cursor: "pointer",
    },
});

export default function StatementSelector({ children, onSelect }) {
    const [visible, setVisible] = useState(false);
    const { manager } = useScriptContext();
    const classes = useStyles();
    const handleOnClick = (registryKey) => () => {
        setVisible(false);
        onSelect(registryKey);
    };

    const handleOnVisibleChange = (visible) => {
        setVisible(visible);
    };

    const AvatarIcon = ({ path }) => {
        return <Icon path={path} size={1} color={"gray"} />;
    };

    let statementClipboard = manager.getStatementClipboard();

    const renderStatements = () => {
        let statementComponents = [];
        Object.keys(manager.statementRegistry).forEach((registryKey) => {
            let registry = manager.statementRegistry[registryKey];
            if (!registry.hidden) {
                statementComponents.push(
                    <List.Item
                        key={registryKey}
                        onClick={handleOnClick(registryKey)}
                        className={classes.listItem}
                    >
                        <List.Item.Meta
                            avatar={<AvatarIcon path={registry.iconPath} />}
                            title={T.translate(registry.name)}
                        />
                    </List.Item>
                );
            }
        });
        return statementComponents;
    };
    const clipboardListItem = (
        <List.Item
            key={"$clipboard"}
            onClick={handleOnClick("$clipboard")}
            className={classes.listItem}
        >
            <List.Item.Meta
                avatar={<AvatarIcon path={mdiClipboardOutline} />}
                title={T.translate("visual_script.clipoard")}
            />
        </List.Item>
    );

    const renderMenu = () => {
        return (
            <div className={classes.selector}>
                <List>
                    {statementClipboard ? clipboardListItem : null}
                    {renderStatements()}
                </List>
            </div>
        );
    };
    return (
        <Popover
            content={renderMenu()}
            trigger={"click"}
            visible={visible}
            onVisibleChange={handleOnVisibleChange}
        >
            {children}
        </Popover>
    );
}
