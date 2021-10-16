import React from "react";
import Expression from "./Expression";
import ParamEditor from "./ParamEditor";
import T from "i18n-react";
import Icon from "@mdi/react";
import { mdiPencil as editIcon } from "@mdi/js";

function getRenderPatternParts(template) {
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

export default function ExpressionPart({
    classes,
    expressionPart,
    onChange,
    onEdit,
}) {
    const handleOnChange = (param) => (value) => {
        onChange({
            ...expressionPart,
            params: { ...expressionPart.params, [param]: value },
        });
    };

    const handleOnClickEdit = () => {
        onEdit && onEdit(expressionPart);
    };

    const renderMethod = () => {
        const templateParts = getRenderPatternParts(
            expressionPart.renderTemplate || T.translage("visual_script.edit")
        );
        const methodComponents = [];
        let key = 0;
        templateParts.forEach((templatePart) => {
            key++;
            if (templatePart.type === "text") {
                methodComponents.push(
                    <span key={key}>{templatePart.value}</span>
                );
            } else {
                let value = expressionPart.params[templatePart.value];
                if (isObject(value) && value.$exp) {
                    methodComponents.push(
                        <Expression
                            key={key}
                            expression={value.$exp}
                            onChange={(expression) => {
                                handleOnChange(templatePart.value)({
                                    $stm: expression,
                                });
                            }}
                            hideControls
                        />
                    );
                } else {
                    methodComponents.push(
                        <ParamEditor
                            key={key + "-editor"}
                            value={expressionPart.params[templatePart.value]}
                            definition={expressionPart.paramDefinitions.find(
                                (item) => {
                                    return item.code === templatePart.value;
                                }
                            )}
                            onClickEdit={handleOnClickEdit}
                            onChange={handleOnChange(templatePart.value)}
                        />
                    );
                }
            }
        });
        key++;
        methodComponents.push(
            <Icon
                className={classes.editIcon}
                key={key}
                path={editIcon}
                size="1em"
                onClick={handleOnClickEdit}
            />
        );
        return methodComponents;
    };

    if (expressionPart.memberType === "method") {
        return (
            <div
                className={
                    classes.part +
                    " " +
                    (expressionPart.renderOperator
                        ? "opearator-value"
                        : expressionPart.memberType)
                }
            >
                {renderMethod()}
            </div>
        );
    } else {
        return (
            <div className={classes.part + " " + expressionPart.memberType}>
                <div className={classes.content}>{expressionPart.name}</div>
            </div>
        );
    }
}
