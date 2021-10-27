import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import ExpressionMember from "./ExpressionMember";
import ExpressionMemberSelector from "./ExpressionMemberSelector";
import styles from "./expressionStyle";
import MethodEditor from "./MethodEditor";
import T from "i18n-react";
import areSameTypes from "../utils/areSameTypes";
const useStyles = createUseStyles(styles);

export default function Expression({
    expression,
    variables,
    expectedType,
    onChange,
    displayOnly,
}) {
    const [editExpressionMember, setEditExpressionMember] = useState(null);
    const [openSelector, setOpenSelector] = useState(false);
    const classes = useStyles();

    if (!variables) {
        throw Error('Expression requires "variables" property ');
    }
    const handleOnChange = (index) => (expressionMember) => {
        let newExpression = [
            ...expression.slice(0, index),
            expressionMember,
            ...expression.slice(index + 1),
        ];
        onChange && onChange(newExpression);
    };
    const handleCancelEdit = () => {
        setEditExpressionMember(null);
    };

    const handleOnParametersEntered = (index) => (expressionMember) => {
        let newExpression = [
            ...expression.slice(0, index),
            expressionMember,
            ...expression.slice(index + 1),
        ];
        setEditExpressionMember(null);
        onChange && onChange(newExpression);
    };
    const handleOnSelect = (member) => {
        if (areSameTypes(expectedType, member.type)) {
            setOpenSelector(false);
        }
        return onChange([...expression, member]);
    };
    const handleOnDeleteLast = () => {
        onChange(expression.slice(0, -1));
    };

    const handleOnEdit = (index) => (expressionMember) => {
        setEditExpressionMember({ index, expressionMember });
    };

    const handleOnOpenSelectorChange = (open) => {
        setOpenSelector(open);
    };

    const handleOnOperatorClick = (index) => () => {
        if (expression[index].type.type === "boolean") {
            let newExpression = [
                ...expression.slice(0, index),
                { ...expression[index], not: !expression[index].not },
                ...expression.slice(index + 1),
            ];
            onChange(newExpression);
        }
    };

    const renderMethodEditor = ({ index, expressionMember }) => {
        return (
            <MethodEditor
                member={expressionMember}
                variables={variables}
                onParametersEntered={handleOnParametersEntered(index)}
                onCancel={handleCancelEdit}
            />
        );
    };

    let expressionGroups = [];
    expressionGroups.push([]);
    expression.forEach((expressionMember, index) => {
        if (index === 0) {
            if (expression.length === 1) {
                expressionGroups[expressionGroups.length - 1].push(
                    <div key={index} className={classes.member}>
                        {T.translate("visual_script.new_expression")}
                    </div>
                );
                return;
            } else {
                return;
            }
        }
        if (expressionMember.renderOperator) {
            expressionGroups.push([]);
            expressionGroups[expressionGroups.length - 1].push(
                <div
                    key={index.toString() + "-operator"}
                    className={
                        classes.member +
                        " operator " +
                        expressionMember.type.type
                    }
                    onClick={handleOnOperatorClick(index)}
                >
                    <div className={classes.content}>
                        {expressionMember.not
                            ? T.translate("visual_script.operator_not") + " "
                            : ""}
                        {expressionMember.renderOperator}
                    </div>
                </div>
            );
            expressionGroups.push([]);
        }
        expressionGroups[expressionGroups.length - 1].push(
            <ExpressionMember
                key={index.toString()}
                classes={classes}
                expressionMember={expressionMember}
                variables={variables}
                onChange={handleOnChange(index)}
                onEdit={handleOnEdit(index)}
            />
        );
    });
    return (
        <>
            {editExpressionMember
                ? renderMethodEditor(editExpressionMember)
                : null}
            <div className={classes.expression}>
                {expressionGroups.map((groupComponent, index) => {
                    return (
                        <div key={index} className={classes.group}>
                            {groupComponent}
                            {!displayOnly &&
                            index === expressionGroups.length - 1 ? (
                                <ExpressionMemberSelector
                                    expression={expression}
                                    variables={variables}
                                    open={openSelector}
                                    onOpenChange={handleOnOpenSelectorChange}
                                    classes={classes}
                                    onSelect={handleOnSelect}
                                    onDeleteLast={handleOnDeleteLast}
                                />
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
