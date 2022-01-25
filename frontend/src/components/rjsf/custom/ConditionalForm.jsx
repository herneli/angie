import Form from "@rjsf/antd";
import React, { useEffect, useState } from "react";
import processForm from "./ConditionalProcessor";
import lodash from "lodash";

const ConditionalForm = React.forwardRef((props, ref) => {
    const { schema, uiSchema, formData } = props;
    const [initialValues, setInitialValues] = useState();

    const [state, setState] = useState();

    useEffect(() => {
        //Guardar el schema original ya que siempre se procesará a través de el y no del current
        initialLoad();
    }, [schema, uiSchema, formData]);

    
    const initialLoad = () => {
        const initValues = {
            originalSchema: lodash.cloneDeep(schema),
            originalUISchema: lodash.cloneDeep(uiSchema),
        };
        setInitialValues(initValues);

        const initialState = processForm(initValues.originalSchema, initValues.originalUISchema, formData);
        setState(initialState);
    };

    const onChange = (e) => {
        const { formData } = e;

        const newState = processForm(initialValues.originalSchema, initialValues.originalUISchema, formData);
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
