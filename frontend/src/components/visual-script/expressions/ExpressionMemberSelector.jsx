import React, { useEffect, useState } from "react";
import { mdiChevronDown, mdiBackspaceOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { List, Button, Popover, Input } from "antd";
import { useScriptContext } from "../ScriptContext";
import getTypeIcon from "../getTypeIcon";
import MethodEditor from "./MethodEditor";
import T from "i18n-react";
import areSameTypes from "../utils/areSameTypes";
import getMembers from "../getMembers";
import { usePackage } from "../../packages/PackageContext";

export default function ExpressionMemberSelector({
    expression,
    variables,
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
    const packageData = usePackage();

    useEffect(() => {
        if (open && (!membersForType || !areSameTypes(membersForType.type, getLastExpressionMember().type))) {
            calculateMembers();
        }
    }, [expression, open]);

    const itemStyle = { padding: "2px 4px" };

    const getLastExpressionMember = () => {
        return expression[expression.length - 1];
    };

    const memberSorter = (a, b) => {
        const comparerA = a.name.toLowerCase();
        const comparerB = b.name.toLowerCase();

        if (comparerA < comparerB) {
            return -1;
        } else if (comparerA > comparerB) {
            return 1;
        } else {
            return 0;
        }
    };

    const calculateMembers = () => {
        let lastExpressionMember = getLastExpressionMember();
        getMembers(manager.getLanguage(), lastExpressionMember.type, { packages: packageData.dependencies }).then(
            (m) => {
                let membersLocal = [];
                if (m.properties) {
                    m.properties.sort(memberSorter).forEach((property) => {
                        membersLocal.push({
                            memberType: lastExpressionMember.memberType === "variable" ? "variable" : "property",
                            ...property,
                        });
                    });
                }
                if (getLastExpressionMember().memberType === "variableContainer") {
                    Object.keys(variables).forEach((variableKey) => {
                        membersLocal.push(variables[variableKey]);
                    });
                }
                // Exclude methods for a context
                if (lastExpressionMember.memberType !== "context" && m.methods) {
                    m.methods.sort(memberSorter).forEach((method) => {
                        // Include methods with code ended with "_setter" only for variables
                        if (!method.code.endsWith("_setter") || lastExpressionMember.memberType === "variable") {
                            membersLocal.push({
                                memberType: "method",
                                ...method,
                            });
                        }
                    });
                }

                if (lastExpressionMember.memberType === "context") {
                    membersLocal.push({
                        memberType: "variableContainer",
                        code: "variables",
                        name: T.translate("visual_script.variables"),
                        type: {
                            type: "object",
                            objectCode: "variables",
                        },
                    });
                }

                setMembersForType({
                    type: lastExpressionMember.type,
                    members: membersLocal,
                });
            }
        );
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
        return <Icon path={path} size={"16px"} color={"gray"} />;
    };

    const renderMenu = () => {
        if (!membersForType) {
            return null;
        }

        return (
            <div className={classes.memberSelectorWrapper}>
                {membersForType.members.length > 1 ? (
                    <Input value={filter} onChange={handleOnChangeFilter} autoFocus style={{ marginBottom: "4px" }} />
                ) : null}
                <List size="small">
                    {expression.length > 1 ? (
                        <List.Item
                            key={"delete"}
                            onClick={handleOnSelect({ memberType: "delete" })}
                            className={classes.memberSelectorListItem}
                            style={itemStyle}>
                            <List.Item.Meta
                                avatar={<AvatarIcon path={mdiBackspaceOutline} />}
                                title={T.translate("visual_script.delete_previous")}
                            />
                        </List.Item>
                    ) : null}
                    {getFilteredMembers().map((member, index) => {
                        return (
                            <List.Item
                                key={index}
                                onClick={handleOnSelect(member)}
                                className={classes.memberSelectorListItem}
                                style={itemStyle}>
                                <List.Item.Meta
                                    avatar={<AvatarIcon path={getTypeIcon(member.type.type)} />}
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
        <div className={classes.member + " selector"}>
            <Popover
                content={renderMenu()}
                trigger={"click"}
                visible={open && !methodMember}
                onVisibleChange={onOpenChange}
                overlayClassName={classes.propertyPopover}
                autoAdjustOverflow={true}>
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
                    variables={variables}
                    onParametersEntered={handleOnParametersEntered}
                    onCancel={handleOnCancelMethodEditor}
                />
            ) : null}
        </div>
    );
}
