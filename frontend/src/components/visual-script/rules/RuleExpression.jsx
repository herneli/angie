import React from "react";
import Expression from "../expressions/Expression";
import { createUseStyles } from "react-jss";
import { Button } from "antd";
import { mdiDelete } from "@mdi/js";
import StatementIcon from "../statements/StatementIcon";

const useStyles = createUseStyles({
    rule: {
        paddingBottom: 2,
        fontSize: 15,
        display: "block",
        paddingTop: 2,
        whiteSpace: "nowrap",
    },
    addRuleButton: {
        marginLeft: 20,
    },
    addGroupButton: {
        marginLeft: 20,
    },
    removeGroupButton: {
        marginLeft: 5,
        padding: 10,
        verticalAlign: "middle",
        fontSize: 8,
    },
    removeGroupButtonContainer: {
        display: "inline-flex",
        verticalAlign: "middle",
    },
    success: {
        padding: 10,
        verticalAlign: "middle",
        color: "#02dd02",
    },
    failure: {
        padding: 10,
        verticalAlign: "middle",
        color: "#ff4747",
    },
    icon: {
        color: "gray",
    },
});

export default function RuleExpression({ rule, variables, onChange, onDelete }) {
    const classes = useStyles();
    const handleOnChange = (expression) => {
        if (expression && expression.length > 0) {
            expression[expression.length - 1].error = expression[expression.length - 1].type !== "boolean";
        }

        onChange && onChange({ ...rule, expression: expression });
    };

    return (
        <div className={classes.rule}>
            <Expression expression={rule.expression} variables={variables} expectedType={{ type: "boolean" }} onChange={handleOnChange} />

            {onDelete ? (
                <div className={classes.removeGroupButtonContainer}>
                    <Button type="text" onClick={onDelete} icon={<StatementIcon className={classes.icon} path={mdiDelete} />} />
                </div>
            ) : null}
        </div>
    );
}
