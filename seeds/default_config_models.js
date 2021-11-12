exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("config_model").del();

    // Inserts seed entries
    await knex("config_model").insert([
        {
            name: "Script",
            code: "script_method",
            data: {
                code: "method",
                name: "Método",
                table: "script_config",
                documentType: "method",
                listFields: [
                    {
                        title: "Código",
                        field: "code",
                    },
                    {
                        title: "Nombre",
                        field: "name",
                    },
                    {
                        title: "Tipo padre",
                        field: ["parentType", "type"],
                    },
                    {
                        title: "Objeto padre",
                        field: ["parentType", "objectCode"],
                    },
                    {
                        title: "Habilitado",
                        field: "isActive",
                    },
                    {
                        title: "Nivel",
                        field: "complexityLevel",
                    },
                ],
                schema: {
                    type: "object",
                    required: ["code", "name", "complexityLevel", "parentType"],
                    properties: {
                        code: {
                            title: "Código",
                            type: "string",
                        },
                        name: {
                            title: "Nombre",
                            type: "string",
                        },
                        complexityLevel: {
                            title: "Nivel",
                            type: "number",
                            enum: [1, 4, 7, 10],
                            enumNames: ["Básico", "Estándar", "Avanzado", "Experto"],
                        },
                        language: {
                            title: "Lenguaje",
                            type: "string",
                            enum: ["js", "python", "groovy"],
                            enumNames: ["Javascript", "Python", "Groovy"],
                        },
                        description: {
                            title: "Descripción",
                            type: "string",
                            default: "",
                        },
                        isActive: {
                            title: "Habilitado",
                            type: "boolean",
                            default: true,
                        },
                        parentType: {
                            $ref: "#/definitions/typeParent",
                            title: "Tipo base",
                        },

                        type: {
                            $ref: "#/definitions/typeExtended",
                            title: "Tipo devuelto",
                        },

                        paramMembers: {
                            title: "Parámetros",
                            type: "array",
                            items: {
                                type: "object",
                                required: ["code", "name", "type"],
                                properties: {
                                    code: {
                                        title: "Código",
                                        type: "string",
                                    },
                                    name: {
                                        title: "Nombre",
                                        type: "string",
                                    },
                                    type: {
                                        $ref: "#/definitions/typeExtended",
                                        title: "Tipo",
                                    },
                                    required: {
                                        title: "Requerido",
                                        type: "boolean",
                                        default: false,
                                    },
                                    options: {
                                        title: "Opciones",
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                code: {
                                                    type: "string",
                                                    title: "Código",
                                                },
                                                value: {
                                                    type: "string",
                                                    title: "Valor",
                                                },
                                                required: {
                                                    type: "boolean",
                                                    title: "Necesaria",
                                                },
                                            },
                                            required: ["code", "type"],
                                        },
                                    },
                                },
                            },
                        },
                        sourceCode: {
                            title: "Código fuente",
                            type: "string",
                        },
                        sourceCodeForBinaryOperator: {
                            title: "Código fuente si es un operador binario ('=', '<', '>', etc.) ",
                            type: "string",
                            default: "",
                        },
                        renderOperator: {
                            title: "Texto a mostrar como operador antes de la plantilla",
                            type: ["string", "null"],
                        },
                        renderTemplate: {
                            title: "Plantilla de texto a mostrar",
                            type: ["string", "null"],
                        },
                        color: {
                            title: "Color de método",
                            type: ["string", "null"],
                            enum: [null, "white", "green", "yellow", "red"],
                        },
                    },
                    definitions: {
                        typeParent: {
                            type: "object",
                            properties: {
                                type: {
                                    type: "string",
                                    title: "Tipo",
                                    enum: [
                                        "$any",
                                        "$anyPrimitive",
                                        "array",
                                        "boolean",
                                        "date",
                                        "number",
                                        "integer",
                                        "object",
                                        "string",
                                    ],
                                    enumNames: [
                                        "Cualquier tipo",
                                        "Cualquier tipo primitivo",
                                        "Lista",
                                        "Boleano",
                                        "Fecha",
                                        "Decimal",
                                        "Entero",
                                        "Objeto",
                                        "String",
                                    ],
                                    default: "",
                                },
                            },
                            dependencies: {
                                type: {
                                    oneOf: [
                                        {
                                            properties: {
                                                type: {
                                                    enum: [
                                                        "$any",
                                                        "$anyPrimitive",
                                                        "boolean",
                                                        "date",
                                                        "number",
                                                        "integer",
                                                        "string",
                                                    ],
                                                },
                                            },
                                        },
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["object"],
                                                },
                                                objectCode: {
                                                    type: "string",
                                                    title: "Código de objeto",
                                                },
                                            },
                                        },
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["array"],
                                                },
                                                items: {
                                                    $ref: "#/definitions/typeParent",
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        typeExtended: {
                            type: "object",
                            properties: {
                                type: {
                                    type: "string",
                                    title: "Tipo",
                                    enum: [
                                        "void",
                                        "$self",
                                        "$item",
                                        "$any",
                                        "$anyPrimitive",
                                        "array",
                                        "boolean",
                                        "date",
                                        "number",
                                        "integer",
                                        "object",
                                        "string",
                                    ],
                                    enumNames: [
                                        "Vacío",
                                        "$self",
                                        "$item",
                                        "Cualquier tipo",
                                        "Cualquier tipo primitivo",
                                        "Lista",
                                        "Boleano",
                                        "Fecha",
                                        "Decimal",
                                        "Entero",
                                        "Objeto",
                                        "String",
                                    ],
                                    default: "",
                                },
                            },
                            dependencies: {
                                type: {
                                    oneOf: [
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["void", "$self", "$item", "$any", "$anyPrimitive"],
                                                },
                                            },
                                        },
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["boolean", "date", "number", "integer", "string"],
                                                },
                                                selectOptions: {
                                                    title: "Valores remotos",
                                                    type: ["string", "null"],
                                                },
                                                widget: {
                                                    title: "Editor",
                                                    type: ["string", "null"],
                                                },
                                            },
                                        },
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["object"],
                                                },
                                                objectCode: {
                                                    type: "string",
                                                    title: "Código de objeto",
                                                },
                                                widget: {
                                                    title: "Editor",
                                                    type: ["string", "null"],
                                                },
                                            },
                                        },
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["array"],
                                                },
                                                items: {
                                                    $ref: "#/definitions/typeExtended",
                                                },
                                                widget: {
                                                    title: "Editor",
                                                    type: ["string", "null"],
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
                uiSchema: {
                    code: {
                        "ui:columnSize": "3",
                    },

                    name: {
                        "ui:columnSize": "3",
                    },

                    complexityLevel: {
                        "ui:columnSize": "3",
                    },
                    language: {
                        "ui:columnSize": "3",
                    },
                    description: {
                        "ui:columnSize": "12",
                        "ui:widget": "textarea",
                        "ui:options": {
                            rows: 2,
                        },
                    },
                    isActive: {
                        "ui:columnSize": "12",
                    },
                    parentType: {
                        "ui:columnSize": "6",
                        "ui:withBorder": true,
                        objectCode: {
                            "ui:widget": "SelectRemoteWidget",
                            "ui:selectOptions":
                                "/configuration/model/script_object/data#path=data&value=code&label=data.name",
                        },
                        items: {
                            "ui:withBorder": true,
                            objectCode: {
                                "ui:widget": "SelectRemoteWidget",
                                "ui:selectOptions":
                                    "/configuration/model/script_object/data#path=data&value=code&label=data.name",
                            },
                        },
                    },
                    type: {
                        "ui:columnSize": "6",
                        "ui:withBorder": true,
                        objectCode: {
                            "ui:widget": "SelectRemoteWidget",
                            "ui:selectOptions":
                                "/configuration/model/script_object/data#path=data&value=code&label=data.name",
                        },
                        items: {
                            "ui:withBorder": true,
                            objectCode: {
                                "ui:widget": "SelectRemoteWidget",
                                "ui:selectOptions":
                                    "/configuration/model/script_object/data#path=data&value=code&label=data.name",
                            },
                        },
                    },

                    sourceCode: {
                        "ui:widget": "textarea",
                        "ui:options": {
                            rows: 8,
                        },
                        "ui:columnSize": "12",
                    },
                    sourceCodeForBinaryOperator: {
                        "ui:columnSize": "12",
                    },
                    renderOperator: {
                        "ui:columnSize": "4",
                    },
                    renderTemplate: {
                        "ui:columnSize": "4",
                    },
                    color: {
                        "ui:columnSize": "4",
                    },
                    paramMembers: {
                        "ui:options": {
                            columns: [
                                { title: "Código", dataIndex: "code" },
                                { title: "Nombre", dataIndex: "name" },
                                { title: "Tipo", dataIndex: ["type", "type"] },
                                { title: "Objeto", dataIndex: ["type", "objectCode"] },
                            ],
                        },
                        items: {
                            code: {
                                "ui:columnSize": "4",
                            },
                            name: {
                                "ui:columnSize": "4",
                            },
                            type: {
                                "ui:columnSize": "12",
                                "ui:withBorder": true,
                                objectCode: {
                                    "ui:widget": "SelectRemoteWidget",
                                    "ui:selectOptions":
                                        "/configuration/model/script_object/data#path=data&value=code&label=data.name",
                                },
                                items: {
                                    "ui:withBorder": true,
                                    objectCode: {
                                        "ui:widget": "SelectRemoteWidget",
                                        "ui:selectOptions":
                                            "/configuration/model/script_object/data#path=data&value=code&label=data.name",
                                    },
                                },
                            },
                            required: {
                                "ui:columnSize": "12",
                            },
                            options: {
                                items: {
                                    code: {
                                        "ui:columnSize": "4",
                                    },
                                    value: {
                                        "ui:columnSize": "4",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        {
            name: "Object",
            code: "script_object",
            data: {
                code: "script_object",
                name: "Definición de objetos",
                table: "script_config",
                documentType: "object",
                listFields: [
                    {
                        title: "Código",
                        field: "code",
                    },
                    {
                        title: "Nombre",
                        field: "name",
                    },
                ],
                schema: {
                    type: "object",
                    required: ["code", "name"],
                    properties: {
                        code: { title: "Código", type: "string" },
                        name: { title: "Nombre", type: "string" },
                        customGroup: { title: "Grupo de personalización", type: "string" },
                        properties: {
                            title: "Campos",
                            type: "array",
                            items: {
                                type: "object",
                                required: ["code", "name", "complexityLevel", "type"],
                                properties: {
                                    code: {
                                        title: "Código",
                                        type: "string",
                                    },
                                    name: { title: "Nombre", type: "string" },
                                    complexityLevel: {
                                        title: "Nivel",
                                        type: "number",
                                        enum: [1, 4, 7, 10],
                                        enumNames: ["Básico", "Estándar", "Avanzado", "Experto"],
                                    },
                                    required: {
                                        title: "Obligatorio",
                                        type: "boolean",
                                    },

                                    description: {
                                        title: "Descripción",
                                        type: "string",
                                    },
                                    type: {
                                        $ref: "#/definitions/type",
                                        title: "Tipo",
                                    },
                                },
                            },
                        },
                    },
                    definitions: {
                        type: {
                            type: "object",
                            properties: {
                                type: {
                                    type: "string",
                                    title: "Tipo",
                                    enum: ["array", "boolean", "date", "number", "integer", "object", "string"],
                                    enumNames: ["Lista", "Boleano", "Fecha", "Decimal", "Entero", "Objeto", "String"],
                                    default: "",
                                },
                            },
                            dependencies: {
                                type: {
                                    oneOf: [
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["boolean", "date", "number", "integer", "string"],
                                                },
                                                selectOptions: {
                                                    title: "Valores remotos",
                                                    type: ["string", "null"],
                                                },
                                                widget: {
                                                    title: "Editor",
                                                    type: ["string", "null"],
                                                },
                                            },
                                        },
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["object"],
                                                },
                                                objectCode: {
                                                    type: "string",
                                                    title: "Código de objeto",
                                                },
                                            },
                                            selectOptions: {
                                                title: "Valores remotos",
                                                type: ["string", "null"],
                                            },
                                            widget: {
                                                title: "Editor",
                                                type: ["string", "null"],
                                            },
                                        },
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["array"],
                                                },
                                                items: {
                                                    $ref: "#/definitions/type",
                                                },
                                            },
                                            widget: {
                                                title: "Editor",
                                                type: ["string", "null"],
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
                uiSchema: {
                    code: {
                        "ui:columnSize": "4",
                    },
                    name: {
                        "ui:columnSize": "4",
                    },
                    customGroup: {
                        "ui:columnSize": "4",
                        "ui:readonly": true,
                    },
                    properties: {
                        "ui:options": {
                            columns: [
                                { title: "Código", dataIndex: "code" },
                                { title: "Nombre", dataIndex: "name" },
                                { title: "Tipo", dataIndex: ["type", "type"] },
                                { title: "Objeto", dataIndex: ["type", "objectCode"] },
                            ],
                        },
                        items: {
                            code: {
                                "ui:columnSize": "3",
                            },
                            name: {
                                "ui:columnSize": "3",
                            },
                            complexityLevel: {
                                "ui:columnSize": "3",
                            },
                            required: {
                                "ui:columnSize": "3",
                            },
                            description: {
                                "ui:columnSize": "12",
                                "ui:widget": "textarea",
                            },
                            type: {
                                "ui:withBorder": true,
                                "ui:columnSize": "12",
                                objectCode: {
                                    "ui:widget": "SelectRemoteWidget",
                                    "ui:selectOptions":
                                        "/configuration/model/script_object/data#path=data&value=code&label=data.name",
                                },
                            },
                        },
                    },
                },
            },
        },
        {
            code: "users_config",
            name: "users_config",
            data: {
                code: "users_config",
                name: "Usuarios",
                table: "users",
                documentType: "object",
                listFields: [
                    {
                        title: "id",
                        field: "id",
                    },
                    {
                        title: "username",
                        field: "username",
                    },
                    {
                        title: "email",
                        field: "email",
                    },
                    {
                        title: "organization_id",
                        field: "organization_id",
                    },
                    {
                        title: "created_time_stamp",
                        field: "created_time_stamp",
                    },
                ],
                schema: {
                    title: "Add User",
                    type: "object",
                    required: ["username"],
                    properties: {
                        username: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                        },
                        organization_id: {
                            type: "string",
                            enum: ["foo", "bar"],
                        },
                    },
                },
                uiSchema: {
                    id: {
                        "ui:columnSize": "3",
                    },
                    username: {
                        "ui:columnSize": "3",
                    },

                    email: {
                        "ui:columnSize": "3",
                    },
                    organization_id: {
                        "ui:columnSize": "3",
                    },
                    created_time_stamp: {
                        "ui:columnSize": "12",
                    },
                },
            },
        },
        {
            name: "Camel Component",
            code: "camel_component",
            data: {
                code: "camel_component",
                name: "Componentes Camel",
                table: "integration_config",
                id_mode: "uuid",
                documentType: "camel_component",
                listFields: [
                    {
                        title: "Código",
                        field: "code",
                    },
                    {
                        title: "Nombre",
                        field: "name",
                    },
                ],
                schema: {
                    type: "object",
                    required: ["code", "name", "xml_template"],
                    properties: {
                        code: { title: "Código", type: "string" },
                        name: { title: "Nombre", type: "string" },
                        xml_template: { title: "Plantilla", type: "string" },
                        options: { title: "Opciones", type: "string" },
                    },
                },
                uiSchema: {
                    code: {
                        "ui:columnSize": "6",
                    },
                    name: {
                        "ui:columnSize": "6",
                    },
                    xml_template: {
                        "ui:columnSize": "12",
                        "ui:widget": "AceEditorWidget",
                        "ui:mode": "html",
                        "ui:beautify": true,
                    },
                    options: {
                        "ui:columnSize": "12",
                        "ui:widget": "AceEditorWidget",
                        "ui:mode": "json",
                        "ui:beautify": true,
                    },
                },
            },
        },
        {
            name: "Tipos de Nodo",
            code: "node_type",
            data: {
                code: "node_type",
                name: "Tipos de Nodo",
                table: "integration_config",
                id_mode: "uuid",
                documentType: "node_type",
                listFields: [
                    {
                        title: "Código",
                        field: "code",
                    },
                    {
                        title: "Nombre",
                        field: "name",
                    },
                    {
                        title: "Grupo",
                        field: "group",
                    },
                ],
                schema: {
                    type: "object",
                    required: ["code", "name", "react_component_type"],
                    properties: {
                        code: { title: "Código", type: "string" },
                        name: { title: "Nombre", type: "string" },
                        group: { title: "Grupo", type: "string" },
                        handles: { title: "Handles", type: "string" },
                        react_component_type: {
                            title: "Tipo Componente",
                            type: "string",
                            enum: ["default", "output", "input", "MultiTargetNode"],
                            enumNames: ["Default", "Output", "Input", "MultiTargetNode"],
                        },
                        camel_component_id: {
                            type: "string",
                            title: "Componente Camel",
                        },
                        json_data_schema: { title: "Formulario", type: "string" },
                        json_ui_schema: { title: "UiSchema", type: "string" },
                        defaults: { title: "Valores por defecto", type: "string" },
                    },
                },
                uiSchema: {
                    code: {
                        "ui:columnSize": "3",
                    },
                    name: {
                        "ui:columnSize": "4",
                    },
                    group: {
                        "ui:columnSize": "3",
                    },
                    handles: {
                        "ui:columnSize": "2",
                    },
                    json_data_schema: {
                        "ui:columnSize": "12",
                        "ui:widget": "AceEditorWidget",
                        "ui:mode": "json",
                        "ui:beautify": true,
                    },
                    json_ui_schema: {
                        "ui:columnSize": "12",
                        "ui:widget": "AceEditorWidget",
                        "ui:mode": "json",
                        "ui:beautify": true,
                    },
                    defaults: {
                        "ui:columnSize": "12",
                        "ui:widget": "AceEditorWidget",
                        "ui:mode": "json",
                        "ui:beautify": true,
                    },

                    react_component_type: {
                        "ui:columnSize": "6",
                    },
                    camel_component_id: {
                        "ui:columnSize": "6",
                        "ui:widget": "SelectRemoteWidget",
                        "ui:selectOptions":
                            "/configuration/model/camel_component/data#path=data&value=id&label=data.name",
                    },
                },
            },
        },
        {
            name: "Contextos",
            code: "script_context",
            data: {
                code: "context",
                name: "Contexto",
                table: "script_config",
                documentType: "context",
                listFields: [
                    {
                        title: "Código",
                        field: "code",
                    },
                    {
                        title: "Nombre",
                        field: "name",
                    },
                    {
                        title: "Lenguaje",
                        field: "language",
                    },
                    {
                        title: "Tipo de contexto",
                        field: ["type", "type"],
                    },
                ],
                schema: {
                    type: "object",
                    properties: {
                        code: {
                            type: "string",
                            title: "Código",
                        },
                        name: {
                            type: "string",
                            title: "Nombre",
                        },
                        language: {
                            title: "Lenguaje",
                            type: "string",
                            enum: ["js", "python", "groovy"],
                            enumNames: ["Javascript", "Python", "Groovy"],
                        },
                        type: { $ref: "#/definitions/type" },
                        startCode: {
                            type: "string",
                            title: 'Ejecutar código al inicio (cargar objecto "context"',
                        },
                        endCode: {
                            type: "string",
                            title: "Ejecutar código al finalizar (variables disponibles",
                        },
                    },
                    definitions: {
                        type: {
                            type: "object",
                            properties: {
                                type: {
                                    type: "string",
                                    title: "Tipo",
                                    enum: ["array", "boolean", "date", "number", "integer", "object", "string"],
                                    enumNames: ["Lista", "Boleano", "Fecha", "Decimal", "Entero", "Objeto", "String"],
                                    default: "",
                                },
                            },
                            dependencies: {
                                type: {
                                    oneOf: [
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["boolean", "date", "number", "integer", "string"],
                                                },
                                                selectOptions: {
                                                    title: "Valores remotos",
                                                    type: ["string", "null"],
                                                },
                                                widget: {
                                                    title: "Editor",
                                                    type: ["string", "null"],
                                                },
                                            },
                                        },
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["object"],
                                                },
                                                objectCode: {
                                                    type: "string",
                                                    title: "Código de objeto",
                                                },
                                            },
                                            selectOptions: {
                                                title: "Valores remotos",
                                                type: ["string", "null"],
                                            },
                                            widget: {
                                                title: "Editor",
                                                type: ["string", "null"],
                                            },
                                        },
                                        {
                                            properties: {
                                                type: {
                                                    enum: ["array"],
                                                },
                                                items: {
                                                    $ref: "#/definitions/type",
                                                },
                                            },
                                            widget: {
                                                title: "Editor",
                                                type: ["string", "null"],
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
                uiSchema: {
                    code: {
                        "ui:columnSize": "4",
                    },
                    name: {
                        "ui:columnSize": "4",
                    },
                    language: {
                        "ui:columnSize": "4",
                    },
                    type: {
                        objectCode: {
                            "ui:widget": "SelectRemoteWidget",
                            "ui:selectOptions":
                                "/configuration/model/script_object/data#path=data&value=code&label=data.name",
                        },
                    },
                    startCode: { "ui:widget": "textarea", "ui:options": { rows: 5 } },
                    endCode: { "ui:widget": "textarea", "ui:options": { rows: 5 } },
                },
            },
        },
        {
            code: "organizations_config",
            name: "organizations_config",
            data: {
                code: "organizations_config",
                name: "Organizaciones",
                table: "organizations",
                documentType: "object",
                listFields: [
                    {
                        title: "id",
                        field: "id",
                    },
                    {
                        title: "Nombre",
                        field: "name",
                    },
                    {
                        title: "Configuration",
                        field: "config",
                    },
                ],
                schema: {
                    title: "Add Organization",
                    type: "object",
                    required: ["name", "config"],
                    properties: {
                        name: {
                            type: "string",
                        },
                        config: {
                            type: "string",
                        },
                    },
                },
                uiSchema: {
                    id: {
                        "ui:columnSize": "3",
                    },
                    name: {
                        "ui:columnSize": "3",
                    },

                    config: {
                        "ui:columnSize": "3",
                    },
                },
            },
        },
    ]);
};
