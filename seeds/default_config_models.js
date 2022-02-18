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
                        code: { title: "Código", type: "string", pattern: "^[a-zA-Z_$][a-zA-Z_$0-9]*$" },
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
                        "ui:widget": "checkbox",
                        "ui:columnSize": "12",
                    },
                    parentType: {
                        "ui:columnSize": "6",
                        "ui:withBorder": true,
                        objectCode: {
                            "ui:widget": "SelectRemoteWithPackageWidget",
                            "ui:selectOptions":
                                "/configuration/model/script_object/data#path=data&value=fullCode&label=data.name",
                        },
                        items: {
                            "ui:withBorder": true,
                            objectCode: {
                                "ui:widget": "SelectRemoteWithPackageWidget",
                                "ui:selectOptions":
                                    "/configuration/model/script_object/data#path=data&value=fullCode&label=data.name",
                            },
                        },
                    },
                    type: {
                        "ui:columnSize": "6",
                        "ui:withBorder": true,
                        objectCode: {
                            "ui:widget": "SelectRemoteWithPackageWidget",
                            "ui:selectOptions":
                                "/configuration/model/script_object/data#path=data&value=fullCode&label=data.name",
                        },
                        items: {
                            "ui:withBorder": true,
                            objectCode: {
                                "ui:widget": "SelectRemoteWithPackageWidget",
                                "ui:selectOptions":
                                    "/configuration/model/script_object/data#path=data&value=fullCode&label=data.name",
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
                                    "ui:widget": "SelectRemoteWithPackageWidget",
                                    "ui:selectOptions":
                                        "/configuration/model/script_object/data#path=data&value=fullCode&label=data.name",
                                },
                                items: {
                                    "ui:withBorder": true,
                                    objectCode: {
                                        "ui:widget": "SelectRemoteWithPackageWidget",
                                        "ui:selectOptions":
                                            "/configuration/model/script_object/data#path=data&value=fullCode&label=data.name",
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
                        code: { title: "Código", type: "string", pattern: "^[a-zA-Z_$][a-zA-Z_$0-9]*$" },
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
                                "ui:widget": "checkbox",
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
                                    "ui:widget": "SelectRemoteWithPackageWidget",
                                    "ui:selectOptions":
                                        "/configuration/model/script_object/data#path=data&value=fullCode&label=data.name",
                                },
                            },
                        },
                    },
                },
            },
        },
        {
            code: "users",
            name: "users",
            data: {
                code: "users",
                name: "Usuarios",
                table: "users",
                id_mode: "uuid",
                selectQuery:
                    "users.*,array_to_string(array_agg(DISTINCT organization.code), ', ') as organization_data",
                group_by: "users.id",
                relation_schema: [
                    {
                        type: "LEFT JOIN",
                        with_table: "organization",
                        on_condition:
                            "organization.id::text =  ANY(TRANSLATE(users.data->>'organization_id', '[]','{}')::TEXT[])",
                        relation_column: "organization_data",
                    },
                ],
                documentType: "user",
                listFields: [
                    // {
                    //     title: "id",
                    //     field: "id",
                    // },
                    {
                        title: "Usuario",
                        field: "username",
                    },
                    {
                        title: "Email",
                        field: "email",
                    },
                    {
                        title: "Roles",
                        field: ["roles"],
                    },
                    {
                        title: "Organization",
                        field: ["organization_data"],
                    },
                    {
                        title: "Fecha Creación",
                        field: "created_timestamp",
                    },
                ],
                schema: {
                    title: "",
                    type: "object",
                    required: ["username"],
                    properties: {
                        username: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                        },
                        roles: {
                            type: "string",
                            title: "Roles",
                        },
                        organization_id: {
                            type: "array",
                            title: "Organization",
                            items: {
                                type: "string",
                                enum: [],
                            },
                            uniqueItems: true,
                        },
                    },
                },
                uiSchema: {
                    username: {
                        "ui:readonly": true,
                        "ui:columnSize": "3",
                    },

                    email: {
                        "ui:readonly": true,
                        "ui:columnSize": "3",
                    },
                    roles: {
                        "ui:readonly": true,
                        "ui:columnSize": "6",
                    },
                    organization_id: {
                        "ui:columnSize": "6",
                        "ui:widget": "SelectRemoteWidget",
                        "ui:mode": "multiple",
                        "ui:selectOptions": "/configuration/model/organization/data#path=data&value=id&label=data.name",
                    },
                    created_time_stamp: {
                        "ui:columnSize": "12",
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
                    {
                        title: "Tipo",
                        field: "react_component_type",
                        key: "data->>'react_component_type'",
                    },
                ],
                schema: {
                    type: "object",
                    required: ["code", "name", "react_component_type"],
                    properties: {
                        code: { title: "Código", type: "string" },
                        name: { title: "Nombre", type: "string" },
                        group: { title: "Grupo", type: "string" },
                        // handles: { title: "Handles", type: "string" },
                        alt_codes: { title: "Códigos Alternativos", type: "string" },
                        react_component_type: {
                            title: "Tipo Componente",
                            type: "string",
                            enum: ["default", "output", "input", "MultiTargetNode", "ButtonNode", "CommentNode"],
                            enumNames: ["Default", "Output", "Input", "MultiTargetNode", "ButtonNode", "CommentNode"],
                        },
                        custom_color: { title: "Personalizar", type: "boolean" },
                        component_border_color: { title: "Borde", type: "string" },
                        component_bg_color: { title: "Fondo", type: "string" },
                        json_data_schema: { title: "Formulario", type: "string" },
                        json_ui_schema: { title: "UiSchema", type: "string" },
                        xml_template: { title: "Plantilla Camel", type: "string" },
                        defaults: { title: "Valores por defecto", type: "string" },
                    },
                },
                uiSchema: {
                    code: {
                        "ui:columnSize": "4",
                    },
                    name: {
                        "ui:columnSize": "4",
                    },
                    group: {
                        "ui:columnSize": "4",
                    },
                    // handles: {
                    //     "ui:columnSize": "2",
                    // },
                    json_data_schema: {
                        "ui:columnSize": "6",
                        "ui:widget": "AceEditorWidget",
                        "ui:height": "600px",
                        "ui:mode": "json",
                        "ui:beautify": true,
                    },
                    json_ui_schema: {
                        "ui:columnSize": "6",
                        "ui:widget": "AceEditorWidget",
                        "ui:height": "600px",
                        "ui:mode": "json",
                        "ui:beautify": true,
                    },
                    xml_template: {
                        "ui:columnSize": "6",
                        "ui:widget": "AceEditorWidget",
                        "ui:mode": "html",
                        "ui:height": "300px",
                        "ui:beautify": true,
                        "ui:disableValidation": true,
                    },
                    defaults: {
                        "ui:columnSize": "6",
                        "ui:widget": "AceEditorWidget",
                        "ui:mode": "json",
                        "ui:height": "300px",
                        "ui:beautify": true,
                    },

                    react_component_type: {
                        "ui:columnSize": "2.5",
                    },

                    custom_color: {
                        "ui:widget": "checkbox",
                        "ui:columnSize": "1.5",
                    },
                    component_border_color: {
                        condition: "custom_color=true",
                        "ui:widget": "ColorField",
                        "ui:colors": ["#000000", "#0041d0", "#237a52", "#ff0072"],
                        "ui:columnSize": "1.5",
                    },
                    component_bg_color: {
                        condition: "custom_color=true",
                        "ui:widget": "ColorField",
                        "ui:colors": ["#000000", "#0041d0", "#237a52", "#ff0072"],
                        "ui:columnSize": "1.5",
                    },
                    alt_codes: {
                        "ui:help": "Util para mantener compatibilidad con codigos cambiados. Separar por (,)",
                        "ui:columnSize": "5",
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
                        code: { title: "Código", type: "string", pattern: "^[a-zA-Z_$][a-zA-Z_$0-9]*$" },
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
                            "ui:widget": "SelectRemoteWithPackageWidget",
                            "ui:selectOptions":
                                "/configuration/model/script_object/data#path=data&value=fullCode&label=data.name",
                        },
                    },
                    startCode: { "ui:widget": "textarea", "ui:options": { rows: 5 } },
                    endCode: { "ui:widget": "textarea", "ui:options": { rows: 5 } },
                },
            },
        },
        {
            code: "organization",
            name: "organization",
            data: {
                code: "organization",
                name: "Organizaciones",
                id_mode: "uuid",
                table: "organization",
                documentType: "organization",
                listFields: [
                    {
                        title: "code",
                        field: "code",
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
                    required: ["code", "name", "config"],
                    properties: {
                        code: {
                            type: "string",
                        },
                        name: {
                            type: "string",
                        },
                        config: {
                            type: "string",
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

                    config: {
                        "ui:columnSize": "3",
                    },
                },
            },
        },
        {
            code: "sections",
            name: "sections",
            data: {
                code: "sections",
                name: "Sections",
                table: "sections",
                id_mode: "uuid",
                documentType: "section",
                listFields: [
                    {
                        title: "code",
                        field: "code",
                    },
                    // {
                    //     title: "title",
                    //     field: "title",
                    // },
                    // {
                    //     title: "icon",
                    //     field: "icon",
                    // },
                    {
                        title: "Ruta",
                        field: "value",
                    },
                    {
                        title: "Roles",
                        field: "roles",
                    },
                ],
                schema: {
                    type: "object",
                    required: ["code", "value"],
                    properties: {
                        code: {
                            type: "string",
                        },
                        // title: {
                        //     type: "string",
                        // },
                        // icon: {
                        //     type: "string",
                        // },
                        value: {
                            title: "Ruta",
                            type: "string",
                        },
                        roles: {
                            title: "Roles",
                            type: "array",
                            items: {
                                type: "string",
                            },
                        },
                        // childrens: {
                        //     title: "SubMenu",
                        //     type: "array",
                        //     items: {
                        //         type: "object",
                        //         required: ["code","value"],
                        //         properties: {
                        //             code: {
                        //                 title: "Código",
                        //                 type: "string",
                        //             },
                        //             title: {
                        //                 title: "Nombre",
                        //                 type: "string",
                        //             },
                        //             icon: {
                        //                 type: "string",
                        //             },
                        //             value: {
                        //                 type: "string",
                        //             },
                        // "childrens": {
                        //     "title": "Opciones",
                        //     "type": "array",
                        //     "items": {
                        //         "type": "object",
                        //         "properties": {
                        //             "code": {
                        //                 "type": "string",
                        //                 "title": "Código"
                        //             },
                        //             "title": {
                        //                 title: "Nombre",
                        //                 type: "string",
                        //             },
                        //             "icon": {
                        //                 type: "string",
                        //             },
                        //             "value": {
                        //                 type: "string",
                        //             },
                        //         },
                        //         "required": ["code"]
                        //     }
                        // }
                        //             }
                        //         },
                        //     }
                    },
                },
                uiSchema: {
                    code: {
                        "ui:columnSize": "3",
                    },
                    title: {
                        type: "string",
                    },
                    icon: {
                        type: "string",
                    },
                    value: {
                        type: "string",
                    },
                    roles: {
                        items: {
                            "ui:columnSize": "6",
                            "ui:widget": "SelectRemoteWidget",
                            "ui:selectOptions": "/roles/#path=data&value=name&label=name",
                        },
                    },
                    // "childrens": {
                    //     "ui:options": {
                    //         "columns": [
                    //             { "title": "Código", "dataIndex": "code" },
                    //             { "title": "Nombre", "dataIndex": "name" },
                    //             { "title": "Tipo", "dataIndex": ["type", "type"] },
                    //             { "title": "Objeto", "dataIndex": ["type", "objectCode"] }
                    //         ]
                    //     },
                    //     "items": {
                    //         "code": {
                    //             "ui:columnSize": "4"
                    //         },
                    //         "name": {
                    //             "ui:columnSize": "4"
                    //         },
                    //         "required": {
                    //             "ui:columnSize": "12"
                    //         },
                    //         "options": {
                    //             "items": {
                    //                 "code": {
                    //                     "ui:columnSize": "4"
                    //                 },
                    //                 icon: {
                    //                     type: "string",
                    //                 },
                    //                 value: {
                    //                     type: "string",
                    //                 },
                    //                 "value": {
                    //                     "ui:columnSize": "4"
                    //                 }

                    //             }
                    //         }
                    // }
                    // }
                },
            },
        },
        {
            name: "Aplicaciones",
            code: "entity_mapper",
            data: {
                code: "entity_mapper",
                name: "Mapeo Entidades",
                table: "integration_config",
                id_mode: "uuid",
                documentType: "entity_mapper",
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
                ],
                schema: {
                    type: "object",
                    required: ["code", "name"],
                    properties: {
                        code: { title: "Código", type: "string" },
                        name: { title: "Nombre", type: "string" },
                        entities: {
                            type: "array",
                            title: "Entidades",
                            items: {
                                type: "object",
                                properties: {
                                    code: { type: "string" },
                                    message_type: { type: "string" },
                                    entity_extraction: { type: "string" },
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
                    entities: {
                        items: {
                            entity_extraction: {
                                "ui:widget": "AceEditorWidget",
                                "ui:mode": "json",
                                "ui:beautify": false,
                            },
                        },
                    },
                },
            },
        },
        {
            name: "Checkpoints",
            code: "checkpoint",
            data: {
                code: "checkpoint",
                name: "Checkpoints",
                table: "integration_config",
                id_mode: "uuid",
                documentType: "checkpoint",
                // selectQuery:
                //     "integration_config.*,array_to_string(array_agg(DISTINCT organization.code), ', ') as organization_data",
                // group_by: "integration_config.id",
                // relation_schema: [
                //     {
                //         type: "LEFT JOIN",
                //         with_table: "organization",
                //         on_condition:
                //             "organization.id::text =  ANY(TRANSLATE(integration_config.data->>'organization_id', '[]','{}')::TEXT[])",
                //         relation_column: "organization_data",
                //     },
                // ],
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
                    // {
                    //     title: "Organization",
                    //     field: ["organization_data"],
                    // },
                ],
                schema: {
                    type: "object",
                    required: ["code", "name"],
                    properties: {
                        code: { title: "Código", type: "string" },
                        name: { title: "Nombre", type: "string" },
                        // organization_id: {
                        //     type: "array",
                        //     title: "Organization",
                        //     items: {
                        //         type: "string",
                        //         enum: [],
                        //     },
                        //     uniqueItems: true,
                        // },
                        healthcheck: {
                            type: "object",
                            properties: {
                                url: { title: "URL", type: "string" },
                                method: {
                                    title: "Método",
                                    type: "string",
                                    enum: ["POST", "GET"],
                                },
                                response_type: {
                                    title: "Tipo Respuesta",
                                    type: "string",
                                    enum: ["alive", "data"],
                                },
                                response_property: { title: "Propiedad Respuesta", type: "string" },
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
                    healthcheck: {
                        url: {
                            "ui:columnSize": "8",
                        },
                        method: {
                            "ui:columnSize": "4",
                        },
                    },

                    // organization_id: {
                    //     "ui:columnSize": "6",
                    //     "ui:widget": "SelectRemoteWidget",
                    //     "ui:mode": "multiple",
                    //     "ui:selectOptions": "/configuration/model/organization/data#path=data&value=id&label=data.name",
                    // },
                },
            },
        },
    ]);
};
