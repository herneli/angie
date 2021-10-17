import React, { useEffect, useState } from "react";
import { mdiChevronDown } from "@mdi/js";
import Icon from "@mdi/react";
import { List, Select, Button, Popover, Input } from "antd";
import T from "i18n-react";
import { useScriptContext } from "../ScriptContext";
import getTypeIcon from "../getTypeIcon";

const { Option } = Select;
export default function ExpressionPartSelector({
    expression,
    classes,
    onChange,
}) {
    const [members, setMembers] = useState();
    const [filter, setFilter] = useState();
    const { manager } = useScriptContext();

    const handleOnChangeFilter = (e) => {
        setFilter(e.target.value);
    };
    const handleOnVisibleChange = (visible) => {
        if (visible) {
            manager.getMembers(expression).then((m) => {
                let membersLocal = [];
                if (m.properties) {
                    m.properties.forEach((property) => {
                        membersLocal.push({
                            memberType: "property",
                            ...property,
                        });
                    });
                }

                if (m.methods) {
                    m.methods.forEach((method) => {
                        membersLocal.push({
                            memberType: "method",
                            ...method,
                        });
                    });
                }
                setMembers(membersLocal);
            });
        } else {
            setMembers(null);
        }
    };

    const getFilteredMembers = () => {
        return members.filter((member) => {
            let code = (member.code || "").toLowerCase();
            let name = (member.name || "").toLowerCase();

            if (!filter) {
                return true;
            } else {
                if (code.includes(filter) || name.includes(filter)) {
                    return true;
                } else {
                    return false;
                }
            }
        });
    };

    const handleOnSelect = (member) => () => {
        setMembers(null);
    };

    const renderMenu = () => {
        if (!members) {
            return null;
        }
        return (
            <div className={classes.memberSelectorWrapper}>
                <Input
                    value={filter}
                    onChange={handleOnChangeFilter}
                    autoFocus
                />
                <List size="small">
                    {getFilteredMembers().map((member, index) => {
                        return (
                            <List.Item
                                key={index}
                                onClick={handleOnSelect(member)}
                                className={classes.memberSelectorListItem}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Icon
                                            path={getTypeIcon(member.type.type)}
                                            size={1}
                                        />
                                    }
                                    title={member.name}
                                    description={member.description}
                                />
                            </List.Item>
                        );
                    })}
                </List>
            </div>
        );
    };
    return (
        <div className={classes.part}>
            <Popover
                content={renderMenu()}
                trigger={"click"}
                visible={!!members}
                onVisibleChange={handleOnVisibleChange}
                overlayClassName={classes.propertyPopover}
            >
                <Button
                    type="text"
                    icon={<Icon size="14px" path={mdiChevronDown} />}
                />
            </Popover>
        </div>
    );
}
