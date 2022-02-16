import Form from "@rjsf/antd";
import React, { useEffect, useState } from "react";
import processForm from "./ConditionalProcessor";
import lodash from "lodash";

const ConditionalForm = React.forwardRef((props, ref) => {
    const { schema, uiSchema, formData } = props;
    const [initialValues, setInitialValues] = useState();
    const [emptyField, setEmptyField] = useState(false);
    const [state, setState] = useState();

    useEffect(() => {
        //Guardar el schema original ya que siempre se procesará a través de el y no del current
        initialLoad();
    }, [schema, uiSchema]);

    const initialLoad = () => {
        const initValues = {
            originalSchema: lodash.cloneDeep(schema),
            originalUISchema: lodash.cloneDeep(uiSchema),
        };
        setInitialValues(initValues);

        const initialState = processForm(initValues.originalSchema, initValues.originalUISchema, formData);
        setState(initialState);
    };

    //Manejo de los errores
    const transformErrors = (errors) => {
        console.log("Form Errors : " + JSON.stringify(errors));
        var e = [];

        errors.map((error) => {
            if (error.message == "should NOT have fewer than 1 items") {
                if (emptyField) {
                    e.push(error);
                }
                return;
            }
            if (error.message == "should be array") {
                return;
            }
            if (error.message == "should match some schema in anyOf") {
                return;
            }
            e.push(error);
        });

        return e;
    };

    const onChange = (e) => {
        const { formData, schema } = e;

        //Comprobación del Required en caso de los arrays.
        Object.keys(formData).forEach((element) => {
            if (schema?.required?.includes(element)) {
                if (Array.isArray(formData[element]) && formData[element].length == 0) {
                    setEmptyField(true);
                }
                if (Array.isArray(formData[element]) && formData[element].length > 0) {
                    setEmptyField(false);
                }
            }
        });

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
                    transformErrors={transformErrors}
                />
            )}
        </>
    );
});

export default ConditionalForm;
