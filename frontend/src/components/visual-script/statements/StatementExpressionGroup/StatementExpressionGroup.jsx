import React from "react";
import T from "i18n-react";
import { createUseStyles } from "react-jss";
import { mdiAnimationPlay } from "@mdi/js";
import ExpressionWrapper from "./ExpressionWrapper";
import StatementIcon from "../StatementIcon";
import { Button } from "antd";
import { useScriptContext } from "../../ScriptContext";

let useStyles = createUseStyles({
    root: {
        margin: "10px 10px",
        padding: "5px 15px",
        minWidth: 450,
        "&.all": {
            borderLeft: "3px solid dodgerblue",
        },
        "&.any": {
            borderLeft: "3px dashed dodgerblue",
        },
        borderRadius: 0,
        background: "rgba(158, 158, 158, 0.15)",
        textAlign: "left",
        boxShadow: "0 0 2px rgba(0, 0, 0, 0), 0 2px 4px rgba(0, 0, 0, 0.33)",
        display: "inline-block",
    },
    title: {
        display: "inline-block",
        lineHeight: "32px",
        color: "gray",
    },
    icon: {
        color: "gray",
        marginRight: "10px",
    },
    addExpressionButton: {
        marginRight: 5,
        float: "right",
        textTransform: "none",
        color: "dodgerblue",
        fontSize: 12,
    },

    statementToolbar: {
        fontSize: 14,
        marginBottom: 10,
    },
    statementFooter: {
        display: "table",
        fontSize: 14,
        marginTop: 5,
        width: "100%",
    },
});

export default function StatementExpressionGroup({
    id,
    statement,
    variables,
    onChange,
    onDelete,
}) {
    const classes = useStyles();
    const { manager } = useScriptContext();

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
        let newExpressions = [
            ...statement.expressions.slice(0, index),
            ...statement.expressions.slice(index + 1),
        ];
        onChange({ ...statement, expressions: newExpressions });
    };

    let expressionComponents = statement.expressions.map(
        (expression, index) => {
            return (
                <ExpressionWrapper
                    key={index}
                    expression={expression}
                    variables={variables}
                    onChange={handleExpressionChange(index)}
                    onDelete={handleExpressionDelete(index)}
                />
            );
        }
    );

    return (
        <div id={statement.id} className={classes.root}>
            <div className={classes.statementToolbar}>
                <div>
                    <span className={classes.title}>
                        <StatementIcon
                            className={classes.icon}
                            path={mdiAnimationPlay}
                        />
                        <span className={classes.titleText}>
                            {statement.name}
                        </span>
                    </span>
                    {onDelete ? <button>Del</button> : null}
                </div>
            </div>
            {expressionComponents}
            <div className={classes.statementFooter}>
                <Button
                    type="link"
                    className={classes.addExpressionButton}
                    onClick={handleAddExpression}
                >
                    {(
                        T.translate("visual_script.add_expression") || ""
                    ).toUpperCase()}
                </Button>
            </div>
        </div>
    );
}
