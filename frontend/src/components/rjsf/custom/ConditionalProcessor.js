import lodash from "lodash";

import { JSONPath } from "jsonpath-plus";

// Advanced conditional fields example
//
// Control the visibility of any field by adding a "condition" property to the
// field's UI Schema. The condition should evaluate to either true or false
// based on the current value(s) of other field(s), e.g. someField=someValue.
// The evaluation is done dynamically upon any change in the form data.
//
// Supported conditions in this example are:
//   foo=bar
//   foo!=bar
//   foo=bar,baz
//   foo!=bar,baz
//   foo=bar&&bar=foo
//   foo=bar||bar=foo
//
// Please note that complex conditions do not work, e.g.
// foo=bar||bar=foo&&baz=bar
//
//
// You can access nested fields via ".". Example: foo.bar[0].foo.
// This are achieved via JSONPath with $.{expression} (Ex: $.foo.bar[0].foo)
// it can be tested on jsonpath.com or similar

function getConditionRule(conditionRule) {
    let rule = [];
    let invert;

    // foo!=bar
    if (conditionRule.indexOf("!=") !== -1) {
        rule = conditionRule.split("!=");
        invert = true;
    }
    // foo=bar
    else if (conditionRule.indexOf("=") !== -1) {
        rule = conditionRule.split("=");
        invert = false;
    }

    if (rule.length !== 2) {
        return false;
    }

    let [field, values] = rule;

    values = values.split(",");

    return {
        field,
        values,
        invert,
    };
}

function getConditionRules(condition = "") {
    let rules = [];
    let allHaveToMatch = false;
    let visible = false;

    // foo=bar || bar=foo
    if (condition.indexOf("||") !== -1) {
        rules = condition.split("||");
        allHaveToMatch = false;
        visible = false;
    }
    // foo=bar && bar=foo
    else if (condition.indexOf("&&") !== -1) {
        rules = condition.split("&&");
        allHaveToMatch = true;
        visible = true;
    }
    // foo=bar
    else {
        rules = [condition];
        allHaveToMatch = true;
        visible = true;
    }

    return {
        rules,
        allHaveToMatch,
        visible,
    };
}

function parseValues(stringValues) {
    return stringValues.map((value) => {
        switch (value) {
            case "true":
                return true;
            case "false":
                return false;
            case "''":
            case '""':
            case "null":
            case "undefined":
                return undefined;

            default:
                return value;
        }
    });
}

function getMatches(condition, formData) {
    const { rules, allHaveToMatch } = getConditionRules(condition);
    let matches = [];
    lodash.each(rules, (rule) => {
        const { field, values: stringValues, invert } = getConditionRule(rule);
        let visible = invert;

        const values = parseValues(stringValues);

        if (field) {
            const currentValues = JSONPath({ path: "$." + field, json: formData });
            lodash.each(values, (value) => {
                if (invert) {
                    visible = visible && lodash.indexOf(currentValues, value) === -1;
                } else {
                    visible = visible || lodash.indexOf(currentValues, value) !== -1;
                }
            });
        }

        matches.push(visible);
    });

    return { matches, allHaveToMatch };
}
/**
 * Calculate new state for form based on UI Schema field conditions and current form data
 *
 * @param schema - Current schema
 * @param uiSchema - Current UI schema
 * @param formData - Current form data
 * @return {object} - Object containing new schema, uiSchema, and formData
 */
export default function processForm(schema, uiSchema, formData, parentProp) {
    let newSchema, newUISchema, newFormData;

    const hasConditions = JSONPath({ path: "$..condition", json: uiSchema, resultType: "path" });
    //Si no hay condiciones, devolver tal cual
    if (lodash.isEmpty(hasConditions)) {
        return {
            schema,
            uiSchema,
            formData,
        };
    }
    //Clonar para evitar modificar la referencia
    newSchema = lodash.cloneDeep(schema);
    newUISchema = lodash.cloneDeep(uiSchema);
    newFormData = lodash.cloneDeep(formData);

    //Recorrer el schema
    lodash.each(uiSchema, (dependantSchema, dependant) => {
        let modifiedUiSchema = dependantSchema;
        //Buscar las condiciones hijas
        let hasChildConditions = JSONPath({ path: "$..condition", json: dependantSchema, resultType: "path" });
        hasChildConditions = lodash.filter(hasChildConditions, (el) => el !== "$['condition']"); //Ignorar la condición actual
        //Si tiene condiciones hijas, procesar recursividad del fragmmento actual
        if (!lodash.isEmpty(hasChildConditions)) {
            const {
                schema: childSchema,
                uiSchema: childUISchema,
                formData: childFormData,
            } = processForm(newSchema.properties[dependant], dependantSchema, formData || {}, dependant);

            newSchema.properties[dependant] = childSchema;
            newUISchema[dependant] = childUISchema;
            newFormData = childFormData;

            modifiedUiSchema = childUISchema;
        }

        //Si tiene una condicion en este nivel, aplicarla
        if (dependantSchema.condition) {
            //En base a la condicion y los datos, obtener los matches
            const { matches, allHaveToMatch } = getMatches(modifiedUiSchema.condition, newFormData);

            let shouldBeVisible = false;
            if (matches.length) {
                //every -> foo=bar && bar=foo ~//~ some -> foo=bar || bar=foo
                shouldBeVisible = allHaveToMatch ? lodash.every(matches, Boolean) : lodash.some(matches, Boolean);
            }
            //Quitar aquellos que no han de ser visibles de los schemas
            if (!shouldBeVisible) {
                //Quitar los valores previos para no interferir con el nuevo schema
                if (parentProp) {
                    newFormData[parentProp] = lodash.omit(newFormData[parentProp], [dependant]);
                } else {
                    newFormData = lodash.omit(newFormData, [dependant]);
                }

                newUISchema = lodash.omit(newUISchema, [dependant]);
                newSchema.properties = lodash.omit(newSchema.properties, [dependant]);
            }
        }
    });

    // Update UI Schema UI order
    // react-jsonschema-form cannot handle extra properties found in UI order
    if (schema["ui:order"]) {
        newUISchema["ui:order"] = lodash.intersection(schema["ui:order"], lodash.keys(newSchema.properties));
    }
    // Update Schema required fields
    if (schema.hasOwnProperty("required")) {
        newSchema.required = lodash.intersection(schema.required, lodash.keys(newSchema.properties));
    }

    return {
        schema: newSchema,
        uiSchema: newUISchema,
        formData: newFormData,
    };
}
