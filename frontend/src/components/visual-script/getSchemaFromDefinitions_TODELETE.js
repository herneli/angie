// import SelectAsyncWidget from "../components/workflow/statement/widgets/SelectAsyncWidget";
import SelectAsyncWidget from "../components/jsonSchemaForm/SelectAsyncWidget";
import memberTypes from "../constants/memberTypes";

const getUiSchema = (paramMember) => {
    let uiSchema = {};
    if (paramMember.selectOptions) {
        uiSchema = {
            "ui:widget": SelectAsyncWidget,
            "ui:selectOptions": paramMember.selectOptions,
        };

        if (paramMember.type === "array") {
            uiSchema.items = {
                "ui:widget": SelectAsyncWidget,
                "ui:selectOptions": paramMember.selectOptions,
            };
        }
    }
    if (paramMember.type === "integer" || paramMember.type === "number") {
        uiSchema["ui:emptyValue"] = 0;
    }
    if (paramMember.widget) {
        uiSchema["ui:widget"] = paramMember.widget;
    }
    return uiSchema;
};
const getSchemaFromType = async (manager, paramMember) => {
    switch (paramMember.type) {
        case "string":
            return Promise.resolve({
                paramMember,
                paramSchema: {
                    type: "string",
                    // default: "",
                },
                paramUiSchema: getUiSchema(paramMember),
            });
        case "date":
            return Promise.resolve({
                paramMember,
                paramSchema: {
                    type: "string",
                    format: "date",
                    default: "",
                },
                paramUiSchema: getUiSchema(paramMember),
            });
        case "integer":
            return Promise.resolve({
                paramMember,
                paramSchema: {
                    type: "integer",
                    default: 0,
                    // required: true
                },
                paramUiSchema: getUiSchema(paramMember),
            });
        case "number":
            return Promise.resolve({
                paramMember,
                paramSchema: {
                    type: "number",
                    default: 0,
                    // required: true
                },
                paramUiSchema: getUiSchema(paramMember),
            });
        case "boolean":
            return Promise.resolve({
                paramMember,
                paramSchema: {
                    type: "boolean",
                    default: false,
                },
                paramUiSchema: getUiSchema(paramMember),
            });
        case "array":
            return Promise.resolve({
                paramMember,
                paramSchema: {
                    type: "array",
                    default: [],
                    items: {
                        type: paramMember.itemsType,
                    },
                },
                paramUiSchema: getUiSchema(paramMember),
            });
        case "object":
            return manager
                .getObjectMembers({
                    baseObject: paramMember,
                    context: manager.context,
                    sorted: false,
                })
                .then((members) => {
                    let filtered_members = members || [];
                    filtered_members = filtered_members.filter((memberItem) => {
                        return memberItem.memberType !== memberTypes.METHOD;
                    });
                    return getSchemaFromMembers(filtered_members).then(
                        ({ schema, uiSchema }) => {
                            return Promise.resolve({
                                paramMember,
                                paramSchema: schema,
                                paramUiSchema: uiSchema,
                            });
                        }
                    );
                });
        default:
            console.error("Type definition not supported: ", paramMember);
            return Promise.reject("Type definition not supported");
    }
};

const getSchemaFromMembers = (manager, definitions) => {
    let schema = {
        type: "object",
        properties: {},
        required: [],
    };

    let uiSchema = {};
    let paramMembers = definitions || [];
    let promises = [];
    paramMembers.forEach((paramMember) => {
        promises.push(getSchemaFromType(manager, paramMember));
    });
    return Promise.all(promises).then((values) => {
        values.forEach(({ paramMember, paramSchema, paramUiSchema }) => {
            if (paramMember.memberType !== memberTypes.METHOD) {
                schema.properties[paramMember.code] = {
                    ...paramSchema,
                    title: paramMember.name,
                };
                if (paramMember.required) {
                    schema.required.push(paramMember.code);
                }
                uiSchema[paramMember.code] = paramUiSchema;
            }
        });
        return Promise.resolve({ schema, uiSchema });
    });
};

export default getSchemaFromMembers;
