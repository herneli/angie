import Form from "@rjsf/antd";
import React, { useEffect, useState } from "react";
import processForm from "./ConditionalProcessor";
import lodash from "lodash";

let originalSchema;
let originalUISchema;

const ConditionalForm = React.forwardRef((props, ref) => {
    const { schema, uiSchema, formData } = props;
    const [state, setState] = useState();

    useEffect(() => {
        //Guardar el schema original ya que siempre se procesará a través de el y no del current
        originalSchema = lodash.cloneDeep(schema);
        originalUISchema = lodash.cloneDeep(uiSchema);

        const initialState = processForm(originalSchema, originalUISchema, formData);
        setState(initialState);
    }, []);

    const onChange = (e) => {
        const { formData } = e;

        const newState = processForm(originalSchema, originalUISchema, formData);
        setState(newState);

        if (props.onChange) props.onChange(e);
    };
    return (
        <>
            {state && (
                <Form
                    ref={ref}
                    {...props}
                    schema={state.schema}
                    uiSchema={state.uiSchema}
                    formData={state.formData}
                    onChange={onChange}
                />
            )}
        </>
    );
});

export default ConditionalForm;
