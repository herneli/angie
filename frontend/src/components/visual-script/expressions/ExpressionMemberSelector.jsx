import React, { useEffect, useState } from "react";
import { mdiChevronDown, mdiBackspaceOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { List, Select, Button, Popover, Input } from "antd";
import { useScriptContext } from "../ScriptContext";
import getTypeIcon from "../getTypeIcon";
import MethodEditor from "./MethodEditor";
import T from "i18n-react";
import areSameTypes from "../utils/areSameTypes";

const { Option } = Select;

export default function ExpressionMemberSelector({
    expression,
    open,
    onOpenChange,
    classes,
    onSelect,
    onDeleteLast,
}) {
    const [membersForType, setMembersForType] = useState();
    const [methodMember, setMethodMember] = useState();
    const [filter, setFilter] = useState();
    const { manager } = useScriptContext();

    useEffect(() => {
        if (
            open &&
            (!membersForType ||
                !areSameTypes(
                    membersForType.type,
                    getLastExpressionMemberType()
                ))
        ) {
            getMembers();
        }
    }, [expression, open]);

    const getLastExpressionMemberType = () => {
        return expression[expression.length - 1].type;
    };

    const getMembers = () => {
        manager.getMembers(getLastExpressionMemberType()).then((m) => {
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
            setMembersForType({
                type: getLastExpressionMemberType(),
                members: membersLocal,
            });
        });
    };
    const handleOnChangeFilter = (e) => {
        setFilter(e.target.value);
    };

    const getFilteredMembers = () => {
        return membersForType.members.filter((member) => {
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
    const replaceType = (type) => {
        const parentType = expression[expression.length - 1].type;
        if (type.type === "$self") {
            return parentType;
        } else if (type.type === "$item") {
            return parentType.items;
        } else if (type.type === "array") {
            if (type.items.type === "$self") {
                return {
                    ...type,
                    items: parentType,
                };
            } else if (type.items.type === "$item") {
                return {
                    ...type,
                    items: parentType.items,
                };
            } else {
                return type;
            }
        } else {
            return type;
        }
    };
    const replaceParamMembers = (paramMembers) => {
        return paramMembers.map((paramMember) => {
            let type = replaceType(paramMember.type);
            return {
                ...paramMember,
                type,
            };
        });
    };
    const handleOnSelect = (member) => () => {
        if (member.memberType === "delete") {
            onDeleteLast();
        } else if (member.memberType === "method") {
            setMethodMember({
                ...member,
                type: replaceType(member.type),
                paramMembers: replaceParamMembers(member.paramMembers || []),
            });
        } else {
            onSelect(member);
        }
    };

    const handleOnParametersEntered = (member) => {
        setMethodMember(null);
        onSelect(member);
    };

    const handleOnCancelMethodEditor = () => {
        setMethodMember(null);
        onOpenChange(false);
    };

    const AvatarIcon = ({ path }) => {
        return <Icon path={path} size={1} color={"gray"} />;
    };

    const renderMenu = () => {
        if (!membersForType) {
            return null;
        }

        return (
            <div className={classes.memberSelectorWrapper}>
                {membersForType.members.length > 1 ? (
                    <Input
                        value={filter}
                        onChange={handleOnChangeFilter}
                        autoFocus
                    />
                ) : null}
                <List size="small">
                    {expression.length > 1 ? (
                        <List.Item
                            key={"delete"}
                            onClick={handleOnSelect({ memberType: "delete" })}
                            className={classes.memberSelectorListItem}
                        >
                            <List.Item.Meta
                                avatar={
                                    <AvatarIcon path={mdiBackspaceOutline} />
                                }
                                title={T.translate(
                                    "visual_script.delete_previous"
                                )}
                            />
                        </List.Item>
                    ) : null}
                    {getFilteredMembers().map((member, index) => {
                        return (
                            <List.Item
                                key={index}
                                onClick={handleOnSelect(member)}
                                className={classes.memberSelectorListItem}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <AvatarIcon
                                            path={getTypeIcon(member.type.type)}
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
        <div className={classes.member}>
            <Popover
                content={renderMenu()}
                trigger={"click"}
                visible={open && !methodMember}
                onVisibleChange={onOpenChange}
                overlayClassName={classes.propertyPopover}
            >
                <Button
                    type="text"
                    icon={<Icon size="14px" path={mdiChevronDown} />}
                    className={classes.selectorButton}
                    size="small"
                />
            </Popover>
            {methodMember ? (
                <MethodEditor
                    member={methodMember}
                    // parentType={expression[expression.length - 1].type}
                    onParametersEntered={handleOnParametersEntered}
                    onCancel={handleOnCancelMethodEditor}
                />
            ) : null}
        </div>
    );
}
