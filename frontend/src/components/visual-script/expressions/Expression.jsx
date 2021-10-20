import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import ExpressionPart from "./ExpressionPart";
import ExpressionPartSelector from "./ExpressionPartSelector";
import styles from "./expressionStyle";
import MethodEditor from "./MethodEditor";
import T from "i18n-react";
const useStyles = createUseStyles(styles);

export default function Expression({ expression, onChange, displayOnly }) {
    const [editExpressionPart, setEditExpressionPart] = useState(null);
    const classes = useStyles();

    const handleOnChange = (index) => (expressionPart) => {
        let newExpression = [
            ...expression.slice(0, index),
            expressionPart,
            ...expression.slice(index + 1),
        ];
        onChange && onChange(newExpression);
    };
    const handleCancelEdit = () => {
        setEditExpressionPart(null);
    };

    const handleOnSelect = (member) => {
        return onChange([...expression, member]);
    };
    const handleOnDeleteLast = () => {
        return onChange(expression.slice(0, -1));
    };

    const handleOnEdit = (index) => (expressionPart) => {
        setEditExpressionPart({ index, expressionPart });
    };

    const renderMethodEditor = ({ index, expressionPart }) => {
        return (
            <MethodEditor member={expressionPart} onCancel={handleCancelEdit} />
        );
    };

    let expressionGroups = [];
    expressionGroups.push([]);
    let renderOperator = false;
    expression.forEach((expressionPart, index) => {
        if (index === 0) {
            if (expression.length === 1) {
                expressionGroups[expressionGroups.length - 1].push(
                    <div key={index} className={classes.part}>
                        {T.translate("visual_script.new_expression")}
                    </div>
                );
                return;
            } else {
                return;
            }
        }
        if (expressionPart.renderOperator) {
            expressionGroups.push([]);
            expressionGroups[expressionGroups.length - 1].push(
                <div
                    key={index.toString() + "-operator"}
                    className={classes.part + " operator"}
                >
                    <div className={classes.content}>
                        {expressionPart.renderOperator}
                    </div>
                </div>
            );
            expressionGroups.push([]);
        }
        expressionGroups[expressionGroups.length - 1].push(
            <ExpressionPart
                key={index.toString()}
                classes={classes}
                expressionPart={expressionPart}
                onChange={handleOnChange(index)}
                onEdit={handleOnEdit(index)}
            />
        );
    });
    return (
        <>
            {editExpressionPart ? renderMethodEditor(editExpressionPart) : null}
            {expressionGroups.map((groupComponent, index) => {
                return (
                    <div key={index} className={classes.group}>
                        {groupComponent}
                        {!displayOnly &&
                        index === expressionGroups.length - 1 ? (
                            <ExpressionPartSelector
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
