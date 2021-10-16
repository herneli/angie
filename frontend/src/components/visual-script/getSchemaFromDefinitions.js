// import SelectAsyncWidget from "../components/workflow/statement/widgets/SelectAsyncWidget";
import SelectAsyncWidget from "../components/jsonSchemaForm/SelectAsyncWidget";
import memberTypes from "../constants/memberTypes";

const getUiSchema = (paramDefinition) => {
    let uiSchema = {};
    if (paramDefinition.remoteValues) {
        uiSchema = {
            "ui:widget": SelectAsyncWidget,
            "ui:remoteValues": paramDefinition.remoteValues,
        };

        if (paramDefinition.type === "array") {
            uiSchema.items = {
                "ui:widget": SelectAsyncWidget,
                "ui:remoteValues": paramDefinition.remoteValues,
            };
        }
    }
    if (
        paramDefinition.type === "integer" ||
        paramDefinition.type === "number"
    ) {
        uiSchema["ui:emptyValue"] = 0;
    }
    if (paramDefinition.widget) {
        uiSchema["ui:widget"] = paramDefinition.widget;
    }
    return uiSchema;
};
const getSchemaFromType = async (manager, paramDefinition) => {
    switch (paramDefinition.type) {
        case "string":
            return Promise.resolve({
                paramDefinition,
                paramSchema: {
                    type: "string",
                    // default: "",
                },
                paramUiSchema: getUiSchema(paramDefinition),
            });
        case "date":
            return Promise.resolve({
                paramDefinition,
                paramSchema: {
                    type: "string",
                    format: "date",
                    default: "",
                },
                paramUiSchema: getUiSchema(paramDefinition),
            });
        case "integer":
            return Promise.resolve({
                paramDefinition,
                paramSchema: {
                    type: "integer",
                    default: 0,
                    // required: true
                },
                paramUiSchema: getUiSchema(paramDefinition),
            });
        case "number":
            return Promise.resolve({
                paramDefinition,
                paramSchema: {
                    type: "number",
                    default: 0,
                    // required: true
                },
                paramUiSchema: getUiSchema(paramDefinition),
            });
        case "boolean":
            return Promise.resolve({
                paramDefinition,
                paramSchema: {
                    type: "boolean",
                    default: false,
                },
                paramUiSchema: getUiSchema(paramDefinition),
            });
        case "array":
            return Promise.resolve({
                paramDefinition,
                paramSchema: {
                    type: "array",
                    default: [],
                    items: {
                        type: paramDefinition.itemsType,
                    },
                },
                paramUiSchema: getUiSchema(paramDefinition),
            });
        case "object":
            return manager
                .getObjectMembers({
                    baseObject: paramDefinition,
                    context: manager.context,
                    sorted: false,
                })
                .then((members) => {
                    let filtered_members = members || [];
                    filtered_members = filtered_members.filter((memberItem) => {
                        return memberItem.memberType !== memberTypes.METHOD;
                    });
                    return getSchemaFromDefinitions(filtered_members).then(
                        ({ schema, uiSchema }) => {
                            return Promise.resolve({
                                paramDefinition,
                                paramSchema: schema,
                                paramUiSchema: uiSchema,
                            });
                        }
                    );
                });
        default:
            console.error("Type definition not supported: ", paramDefinition);
            return Promise.reject("Type definition not supported");
    }
};

const getSchemaFromDefinitions = (manager, definitions) => {
    let schema = {
        type: "object",
        properties: {},
        required: [],
    };

    let uiSchema = {};
    let paramDefinitions = definitions || [];
    let promises = [];
    paramDefinitions.forEach((paramDefinition) => {
        promises.push(getSchemaFromType(manager, paramDefinition));
    });
    return Promise.all(promises).then((values) => {
        values.forEach(({ paramDefinition, paramSchema, paramUiSchema }) => {
            if (paramDefinition.memberType !== memberTypes.METHOD) {
                schema.properties[paramDefinition.code] = {
                    ...paramSchema,
                    title: paramDefinition.name,
                };
                if (paramDefinition.required) {
                    schema.required.push(paramDefinition.code);
                }
                uiSchema[paramDefinition.code] = paramUiSchema;
            }
        });
        return Promise.resolve({ schema, uiSchema });
    });
};

export default getSchemaFromDefinitions;
