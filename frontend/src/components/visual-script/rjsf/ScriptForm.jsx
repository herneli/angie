import React from "react";
import Form from "@rjsf/antd";
import formConfig from "../../rjsf";
import OneOfExpressionField from "./OneOfExpressionField";
import ExpressionField from "./ExpressionField";
import LogWidget from "./LogWidget";

export default function ScriptForm(props) {
    let scriptWidgets = {
        LogWidget: LogWidget,
    };
    let scriptFields = {
        OneOfField: OneOfExpressionField,
        ExpressionField: ExpressionField,
    };

    let enhancedProps = {
        ...props,
        widgets: props.widgets
            ? { ...formConfig.widgets, ...props.widgets, ...scriptWidgets }
            : { ...formConfig.widgets, ...scriptWidgets },
        fields: props.fields
            ? { ...formConfig.fields, ...props.fields, ...scriptFields }
            : { ...formConfig.widgets, ...scriptFields },
    };

    return (
        <Form
            {...enhancedProps}
            ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
            ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
        />
    );
}
