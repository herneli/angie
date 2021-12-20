exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("config_model").del();

    // Inserts seed entries
    await knex("config_model").insert([
        {
            name: "Script method",
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
                    required: ["code", "name", "complexityLevel", "language", "parentType"],
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
                                            required: ["code"],
                                        },
                                    },
                                },
                            },
                        },
                        imports: {
                            title: "Imports",
                            type: "array",
                            items: {
                                type: "string",
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
                                        "$anyObject",
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
                                        "Cualquier objecto",
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
                                                        "$anyObject",
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
                                        "$anyObject",
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
                                        "Cualquier objeto",
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
                                                        "void",
                                                        "$self",
                                                        "$item",
                                                        "$any",
                                                        "$anyPrimitive",
                                                        "$anyObject",
                                                    ],
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
                    imports: {
                        "ui:columnSize": "6",
                    },
                    sourceCode: {
                        "ui:widget": "AceEditorWidget",
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
                                    path: {
                                        title: "Ruta",
                                        type: "string",
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
                            path: { "ui:columnSize": "6" },
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
                id_mode: "uuid",
                selectQuery: "users.*,p.data as profile_data,o.data as organization_data",
                relation_schema: [
                    {
                        type: "LEFT JOIN",
                        tabletoJoin: "profile as p",
                        column1: "(users.data->>'profile')::text",
                        column2: " text(p.id)",
                        relationColumn: "profile_data",
                    },
                    {
                        type: "LEFT JOIN",
                        tabletoJoin: "organization as o",
                        column1: "(users.data->>'organization_id')::text",
                        column2: " text(o.id)",
                        relationColumn: "organization_data",
                    },
                ],
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
                        title: "Perfil",
                        field: ["profile_data", "name"],
                    },
                    {
                        title: "Organization",
                        field: ["organization_data", "name"],
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
                        profile: {
                            type: "string",
                            title: "Perfil",
                        },
                        organization_id: {
                            type: "string",
                            title: "Organization",
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
                    profile: {
                        "ui:columnSize": "6",
                        "ui:widget": "SelectRemoteWidget",
                        "ui:selectOptions":
                            "/configuration/model/profile_config/data#path=data&value=id&label=data.name",
                    },
                    organization_id: {
                        "ui:columnSize": "6",
                        "ui:widget": "SelectRemoteWidget",
                        "ui:selectOptions":
                            "/configuration/model/organization_config/data#path=data&value=id&label=data.name",
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
                        key: "code",
                    },
                    {
                        title: "Nombre",
                        field: "name",
                        key: "data->>'name'",
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
                        key: "data->>'name'",
                    },
                    {
                        title: "Grupo",
                        field: "group",
                        key: "data->>'group'",
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
                            enum: ["default", "output", "input", "MultiTargetNode", "ButtonNode"],
                            enumNames: ["Default", "Output", "Input", "MultiTargetNode", "ButtonNode"],
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
                            "/configuration/model/camel_component/data#path=data&value=code&label=data.name",
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
            code: "organization_config",
            name: "organization_config",
            data: {
                code: "organization_config",
                name: "Organizaciones",
                id_mode: "uuid",
                table: "organization",
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
        {
            code: "profile_config",
            name: "profile_config",
            data: {
                code: "profile_config",
                name: "Perfiles",
                table: "profile",
                id_mode: "uuid",
                documentType: "object",
                listFields: [
                    {
                        title: "id",
                        field: "id",
                    },
                    {
                        title: "name",
                        field: "name",
                    },
                    {
                        title: "sections",
                        field: "sections",
                    },
                ],
                schema: {
                    title: "Create Profile",
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: {
                            type: "string",
                        },
                        sections: {
                            type: "array",
                            items: {
                                type: "string",
                                enum: [
                                    "/admin/users",
                                    "/admin/profiles",
                                    "/admin/organization",
                                    "/admin/integration",
                                    "/admin/node_type",
                                    "/admin/camel_component",
                                    "/admin/config_context",
                                    "/admin/config_method",
                                    "/admin/config_object",
                                    "/admin/gestion",
                                    "/admin/comunicaciones",
                                    "/admin/personalization",
                                    "/admin/script/test_groovy",
                                ],
                            },
                            uniqueItems: true,
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
                    sections: {
                        "ui:ArrayFieldTemplate": null,
                        "ui:columnSize": "3",
                        "ui:widget": "MultipleSelectWidget",
                        "ui:url": "/getMenuConfiguration",
                    },
                },
            },
        },
    ]);
};
