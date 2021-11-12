import React, { Component } from "react";
import Expression from "../expressions/Expression";
import { getUiOptions } from "@rjsf/core/lib/utils";
import { useScriptContext } from "../ScriptContext";
import { Form } from "antd";
import { classExpression } from "@babel/types";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    expressionWrapper: {
        marginLeft: "2px",
    },
});

export default function ExpressionField({ name, formData, schema, uiSchema, onChange }) {
    const { manager } = useScriptContext();
    const classes = useStyles();

    const handleOnChange = (value) => {
        onChange && onChange({ $exp: value });
    };

    let { variables, expectedType, hideLabel } = getUiOptions(uiSchema);
    let expression = formData.$exp || manager.newExpression();

    if (!hideLabel) {
        return (
            <Form.Item label={schema.title || name} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                <div className={classes.expressionWrapper}>
                    <Expression
                        expression={expression}
                        variables={variables}
                        onChange={handleOnChange}
                        expectedType={expectedType}
                    />
                </div>
            </Form.Item>
        );
    } else {
        return (
            <div className={classes.expressionWrapper}>
                <Expression
                    expression={expression}
                    variables={variables}
                    onChange={handleOnChange}
                    expectedType={expectedType}
                />
            </div>
        );
    }
}
