import Form from "@rjsf/antd";
import React, { useState } from "react";
import processForm from "./ConditionalProcessor";
import lodash from "lodash";

const ConditionalForm = React.forwardRef((props, ref) => {
    const [initialValues, setInitialValues] = useState();
    const [emptyField, setEmptyField] = useState(false);

    const initialLoad = ({ schema, uiSchema, formData }) => {
        const initValues = {
            originalSchema: lodash.cloneDeep(schema),
            originalUISchema: lodash.cloneDeep(uiSchema),
        };
        setInitialValues(initValues);

        const initialState = processForm(initValues.originalSchema, initValues.originalUISchema, formData);
        // setState(initialState);
        return initialState;
    };
    //Se construye de esta forma para unicamente ejecutarlo una vez y al inicio del componente
    const [state, setState] = useState(() => initialLoad(props));

    //Manejo de los errores
    const transformErrors = (errors) => {
        console.log("Form Errors : " + JSON.stringify(errors));

        let e = lodash.filter(errors, (error) => {
            if (error.message.indexOf("should NOT have fewer than 1 items") !== -1) {
                if (emptyField) {
                    return true;
                }
                return false;
            }
            if (error.message.indexOf("should be array") !== -1) {
                return false;
            }
            if (error.message.indexOf("should match some schema in anyOf") !== -1) {
                return false;
            }
            return true;
        });

        return e;
    };

    const redraw = ({ formData, schema }) => {
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
    };

    const onChange = (e) => {
        // console.log(e.formData);
        redraw(e);

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
