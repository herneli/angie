import { isObject } from "@rjsf/core/lib/utils";

const convertToExpressionSchema = (schema, uiSchema, variables) => {
    if (schema.type === "object" && isObject(schema.properties)) {
        let expSchema = {
            type: "object",
            required: schema.required,
            properties: {},
        };
        Object.keys(schema.properties).forEach((paramKey) => {
            expSchema.properties[paramKey] = {
                title: schema.properties[paramKey].title || paramKey,
                oneOf: [
                    {
                        ...schema.properties[paramKey],
                        title: "",
                        // This lines is needed to ensure that "Expression object" is not considered a valid primary object
                        additionalProperties: false,
                    },
                    {
                        title: "Expresión",
                        type: "object",
                        properties: {
                            $exp: {
                                type: "array",
                            },
                        },
                        required: ["$exp"],
                    },
                ],
                default: schema.properties[paramKey].type === "object" ? {} : null,
            };
            // expSchema.properties[paramKey].oneOf[0].title = "";
            uiSchema[paramKey] = {
                ...uiSchema[paramKey],
                "ui:variables": variables,
                "ui:expectedType": schema.properties[paramKey],
            };
        });

        return { schema: expSchema, uiSchema: uiSchema };
    } else {
        return { schema: schema, uiSchema: uiSchema };
    }
};

export default convertToExpressionSchema;
