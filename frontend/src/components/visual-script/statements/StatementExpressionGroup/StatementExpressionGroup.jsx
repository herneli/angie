import React from "react";
import T from "i18n-react";
import { createUseStyles } from "react-jss";
import ExpressionWrapper from "./ExpressionWrapper";
import { Button } from "antd";
import StatementBox from "../StatementBox";
import { useScriptContext } from "../../ScriptContext";
import registry from ".";
import { mdiPlus } from "@mdi/js";
import ReactDragListView from "react-drag-listview";

let useStyles = createUseStyles({
    addExpressionButton: {
        marginRight: 5,
        float: "right",
        textTransform: "none",
        color: "dodgerblue",
        fontSize: 12,
    },

    statementFooter: {
        display: "table",
        fontSize: 14,
        marginTop: 5,
        width: "100%",
    },
});

export default function StatementExpressionGroup({ statement, variables, onChange, onDelete }) {
    const classes = useStyles();
    const { manager } = useScriptContext();

    const handleOnCustomAction = (code) => {
        switch (code) {
            case "addExpression":
                handleAddExpression();
        }
    };
    const handleAddExpression = () => {
        onChange({
            ...statement,
            expressions: [...statement.expressions, manager.newExpression()],
        });
    };

    const handleExpressionChange = (index) => (value) => {
        let newExpressions = [
            ...statement.expressions.slice(0, index),
            value,
            ...statement.expressions.slice(index + 1),
        ];
        onChange({ ...statement, expressions: newExpressions });
    };

    const handleExpressionDelete = (index) => (value) => {
        let newExpressions = [...statement.expressions.slice(0, index), ...statement.expressions.slice(index + 1)];
        onChange({ ...statement, expressions: newExpressions });
    };

    const handleExpressionDuplicate = (index) => (value) => {
        let newExpressions = [
            ...statement.expressions.slice(0, index),
            statement.expressions[index],
            ...statement.expressions.slice(index),
        ];
        onChange({ ...statement, expressions: newExpressions });
    };
    const handleOnDragEnd = (fromIndex, toIndex) => {
        if (fromIndex !== toIndex) {
            let newExpressions = [...statement.expressions];
            let fromExpression = newExpressions[fromIndex];
            newExpressions.splice(fromIndex, 1);
            newExpressions.splice(toIndex, 0, fromExpression);
            onChange({ ...statement, expressions: newExpressions });
        }
    };
    let expressionComponents = statement.expressions.map((expression, index) => {
        return (
            <ExpressionWrapper
                key={index}
                expression={expression}
                variables={variables}
                expectedType={{ type: "void" }}
                onChange={handleExpressionChange(index)}
                onDelete={handleExpressionDelete(index)}
                onDuplicate={handleExpressionDuplicate(index)}
            />
        );
    });

    return (
        <StatementBox
            statement={statement}
            variables={variables}
            iconPath={registry.iconPath}
            onChange={onChange}
            onDelete={onDelete}
            customActions={[
                {
                    code: "addExpression",
                    iconPath: mdiPlus,
                    text: T.translate("visual_script.add_expression"),
                    asButton: true,
                },
            ]}
            onCustomAction={handleOnCustomAction}>
            <ReactDragListView
                handleSelector="span.drag-handle"
                nodeSelector="div.drag-item"
                onDragEnd={handleOnDragEnd}>
                {expressionComponents}
            </ReactDragListView>
        </StatementBox>
    );
}
