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
                    { ...schema.properties[paramKey], title: "" },
                    {
                        title: "Expresión",
                        type: "object",
                        properties: {
                            $exp: {},
                        },
                        required: ["$exp"],
                    },
                ],
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
