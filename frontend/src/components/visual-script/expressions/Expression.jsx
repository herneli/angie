import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import ExpressionMember from "./ExpressionMember";
import ExpressionMemberSelector from "./ExpressionMemberSelector";
import styles from "./expressionStyle";
import MethodEditor from "./MethodEditor";
import T from "i18n-react";
const useStyles = createUseStyles(styles);

export default function Expression({ expression, onChange, displayOnly }) {
    const [editExpressionMember, setEditExpressionMember] = useState(null);
    const classes = useStyles();

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
        return onChange([...expression, member]);
    };
    const handleOnDeleteLast = () => {
        onChange(expression.slice(0, -1));
    };

    const handleOnEdit = (index) => (expressionMember) => {
        setEditExpressionMember({ index, expressionMember });
    };

    const renderMethodEditor = ({ index, expressionMember }) => {
        return (
            <MethodEditor
                member={expressionMember}
                onParametersEntered={handleOnParametersEntered(index)}
                onCancel={handleCancelEdit}
            />
        );
    };

    let expressionGroups = [];
    expressionGroups.push([]);
    let renderOperator = false;
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
                    className={classes.member + " operator"}
                >
                    <div className={classes.content}>
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
            {expressionGroups.map((groupComponent, index) => {
                return (
                    <div key={index} className={classes.group}>
                        {groupComponent}
                        {!displayOnly &&
                        index === expressionGroups.length - 1 ? (
                            <ExpressionMemberSelector
                                expression={expression}
                                classes={classes}
                                onSelect={handleOnSelect}
                                onDeleteLast={handleOnDeleteLast}
                            />
                        ) : null}
                    </div>
                );
            })}
        </>
    );
}
