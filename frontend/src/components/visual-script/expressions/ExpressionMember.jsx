import React from "react";
import Expression from "./Expression";
import ParamEditor from "./ParamEditor";
import T from "i18n-react";
import Icon from "@mdi/react";
import { mdiPencil as editIcon } from "@mdi/js";

function getRenderPatternParts(template) {
    if (!template) {
        return [];
    }
    let pattern = /({{.+?}})/g;
    let patternIn = /{{(.+?)}}/;
    let templateParts = template.split(pattern);

    let templatePartsOut = [];
    templateParts.forEach((part) => {
        let match = part.match(patternIn);
        if (match) {
            templatePartsOut.push({ type: "param", value: match[1] });
        } else {
            if (part) {
                templatePartsOut.push({ type: "text", value: part });
            }
        }
    });
    return templatePartsOut;
}

function isObject(value) {
    return value !== null && typeof value === "object";
}

export default function ExpressionMember({ classes, expressionMember, variables, onChange, onEdit }) {
    const handleOnChange = (param) => (value) => {
        onChange({
            ...expressionMember,
            params: { ...expressionMember.params, [param]: value },
        });
    };

    const handleOnClickEdit = () => {
        onEdit && onEdit(expressionMember);
    };

    const renderMethod = () => {
        const templateParts = getRenderPatternParts(expressionMember.renderTemplate);
        const methodComponents = [];
        let key = 0;
        templateParts.forEach((templatePart) => {
            key++;
            if (templatePart.type === "text") {
                methodComponents.push(<span key={key}>{templatePart.value}</span>);
            } else {
                if (!(templatePart.value in (expressionMember.params || {}))) {
                    return "{{" + templatePart.value + "}}";
                }
                let value = expressionMember.params[templatePart.value];
                if (isObject(value) && value.$exp) {
                    methodComponents.push(
                        <Expression
                            key={key}
                            expression={value.$exp}
                            variables={variables}
                            onChange={(expression) => {
                                handleOnChange(templatePart.value)({
                                    $exp: expression,
                                });
                            }}
                            displayOnly
                        />
                    );
                } else {
                    methodComponents.push(
                        <ParamEditor
                            key={key + "-editor"}
                            value={expressionMember.params[templatePart.value]}
                            paramMember={expressionMember.paramMembers.find((item) => {
                                return item.code === templatePart.value;
                            })}
                            onClickEdit={handleOnClickEdit}
                            onChange={handleOnChange(templatePart.value)}
                        />
                    );
                }
            }
        });
        key++;
        methodComponents.push(
            <Icon className={classes.editIcon} key={key} path={editIcon} size="1em" onClick={handleOnClickEdit} />
        );
        return methodComponents;
    };

    if (expressionMember.memberType === "method") {
        return (
            <div
                className={
                    classes.member +
                    " " +
                    (expressionMember.renderOperator ? "opearator-value" : expressionMember.memberType) +
                    (expressionMember.color ? " " + expressionMember.color : "")
                }>
                {renderMethod()}
            </div>
        );
    } else {
        return (
            <div className={classes.member + " " + expressionMember.memberType}>
                <div className={classes.content}>{expressionMember.name}</div>
            </div>
        );
    }
}
