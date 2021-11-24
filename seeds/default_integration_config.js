exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("integration_config").del();

    // Inserts seed entries
    await knex("integration_config").insert([
        {
            id: "fdfe4184-2879-4670-ad4c-33b939d1906f",
            document_type: "camel_component",
            code: "code",
            data: {
                code: "code",
                name: "Code",
                options: '{"language": "string","source":"string","target":"string","code":"string"}',
                xml_template:
                    '<route> <from uri="direct:{{source}}"/> <setBody>  <{{language}}><![CDATA[{{safe code}}]]></{{language}}>    </setBody> <multicast>{{#each target}} <to uri="direct:{{this}}"/> {{/each}}</multicast> </route>',
            },
        },
        {
            id: "e664f0ea-9e3c-460b-826e-c5f1c0e1522f",
            document_type: "camel_component",
            code: "delay",
            data: {
                code: "delay",
                name: "Delay",
                options: '{"source":"string","target":"string","delay":"string"}',
                xml_template:
                    '<route><from uri="direct:{{source}}"/><delay><constant>{{delay}}</constant></delay><to uri="mock:result"/><multicast>{{#each target}} <to uri="direct:{{this}}"/> {{/each}}</multicast> </route>',
            },
        },
        {
            id: "7662d716-a3da-4e92-9136-da2000fdc8a1",
            document_type: "camel_component",
            code: "generic_input",
            data: {
                code: "generic_input",
                name: "Generic Input",
                options:
                    '{"protocol":"string","target":"string","hostname":"string","port":"number","path":"string","query_params":"array"}',
                xml_template:
                    '<route> <from uri="{{protocol}}://{{hostname}}:{{port}}{{path}}{{querystring query_params}}"/> <multicast>{{#each target}} <to uri="direct:{{this}}"/> {{/each}}</multicast></route>',
            },
        },
        {
            id: "1e2cd28f-7f6f-40de-a153-d716c2e4bd2b",
            document_type: "camel_component",
            code: "generic_output",
            data: {
                code: "generic_output",
                name: "Generic Output",
                options:
                    '{"protocol":"string","source":"string","hostname":"string","port":"number","path":"string","query_params":"array"}',
                xml_template:
                    '<route> <from uri="direct:{{source}}"/> <to uri="{{protocol}}://{{hostname}}:{{port}}{{path}}{{querystring query_params}}"/> </route>',
            },
        },
        {
            id: "5eb79d2d-5b7d-4666-83b2-9c0abb80f569",
            document_type: "camel_component",
            code: "log",
            data: {
                code: "log",
                name: "Log",
                options: '{"name":"string"}',
                xml_template: '<route> <from uri="direct:{{source}}"/> <to uri="log:{{name}}"/> </route>',
            },
        },
        {
            id: "1ea0f437-0e74-4ffa-b64e-7f75781178cb",
            document_type: "camel_component",
            code: "loop",
            data: {
                id: "1ea0f437-0e74-4ffa-b64e-7f75781178cb",
                code: "loop",
                name: "Loop",
                options: '{\n  "source": "string",\n  "count": "number",\n  "handles": "array"\n}',
                xml_template:
                    '<route>\n    <from uri="direct:{{source}}"/>\n    <loop copy="true">\n        <constant>\n            {{count}}\n        </constant>\n        <multicast>\n            {{#each handles.[0].to}}\n            <to uri="direct:{{this}}"/>\n            {{/each}}\n        </multicast>\n    </loop>\n    <multicast>\n        {{#each handles.[1].to}}\n        <to uri="direct:{{this}}"/>\n        {{/each}}\n    </multicast>\n</route>',
            },
        },
        {
            id: "67d93216-b818-44d2-a82c-5da0a305a94c",
            document_type: "camel_component",
            code: "switch",
            data: {
                id: "67d93216-b818-44d2-a82c-5da0a305a94c",
                code: "switch",
                name: "Switch",
                options: '{\n    "language": "simple",\n    "source": "string",\n    "handles": "array"\n}',
                xml_template:
                    '<route>\n    <from uri="direct:{{source}}" />\n    <choice>\n        {{#each handles}}\n        <when>\n            <{{../language}}>\n                {{safe this.condition}}\n            </{{../language}}>\n            <multicast>\n                {{#each this.to}}\n                <to uri="direct:{{this}}" />\n                {{/each}}\n            </multicast>\n        </when>\n        {{/each}}\n    </choice>\n</route>',
            },
        },
    ]);

    // Inserts seed entries
    await knex("integration_config").insert([
        {
            id: "50b890b5-a309-4b7c-9fa0-5c8b23b25c6f",
            document_type: "node_type",
            code: "groovy",
            data: {
                id: "50b890b5-a309-4b7c-9fa0-5c8b23b25c6f",
                code: "groovy",
                name: "Groovy Code",
                group: "Utilidades",
                handles: "in,out",
                defaults: '{\n    "language": "groovy",\n    "code": ""\n}',
                form_type: "jsonschema",
                node_type: "node",
                plugin_id: null,
                description: "Replaces body by custom groovy code",
                json_ui_schema:
                    '{\n    "code": {\n        "ui:columnSize": "12",\n        "ui:widget": "AceEditorWidget",\n        "ui:mode": "json",\n        "ui:beautify": true\n    }\n}',
                json_data_schema:
                    '{\n    "description": "Replaces body by custom groovy code",\n    "type": "object",\n    "required": [\n        "label",\n        "code"\n    ],\n    "properties": {\n        "label": {\n            "type": "string"\n        },\n        "code": {\n            "type": "string"\n        }\n    }\n}',
                camel_component_id: "fdfe4184-2879-4670-ad4c-33b939d1906f",
                form_type_plugin_id: null,
                react_component_type: "default",
            },
        },
        {
            id: "331a8e65-ed4e-4911-89b3-20f256870301",
            document_type: "node_type",
            code: "http_input",
            data: {
                id: "331a8e65-ed4e-4911-89b3-20f256870301",
                code: "http_input",
                name: "HTTP Input",
                group: "Comunicaciones",
                handles: "in",
                defaults:
                    '{\n    "protocol": "jetty:http",\n    "hostname": "0.0.0.0",\n    "path": "",\n    "port": 8888\n}',
                json_ui_schema:
                    '{\n    "hostname": {\n        "ui:columnSize": "4"\n    },\n    "port": {\n        "ui:columnSize": "3"\n    },\n    "path": {\n        "ui:columnSize": "3"\n    }\n}',
                json_data_schema:
                    '{\n    "description": "HTTP Listener",\n    "type": "object",\n    "required": [\n        "label",\n        "hostname",\n        "port"\n    ],\n    "properties": {\n        "label": {\n            "type": "string"\n        },\n        "hostname": {\n            "title": "Host",\n            "type": "string"\n        },\n        "path": {\n            "title": "Ruta",\n            "type": "string"\n        },\n        "port": {\n            "title": "Puerto",\n            "type": "number"\n        },\n        "query_params": {\n            "title": "Parámetros",\n            "type": "array",\n            "items": {\n                "type": "object",\n                "required": [\n                    "code",\n                    "value"\n                ],\n                "properties": {\n                    "code": {\n                        "title": "Clave",\n                        "type": "string"\n                    },\n                    "value": {\n                        "title": "Valor",\n                        "type": "string"\n                    }\n                }\n            }\n        }\n    }\n}',
                camel_component_id: "7662d716-a3da-4e92-9136-da2000fdc8a1",
                react_component_type: "input",
            },
        },
        {
            id: "a97136c1-68b6-4b97-b6b1-acc692289e3d",
            document_type: "node_type",
            code: "http_output",
            data: {
                id: "a97136c1-68b6-4b97-b6b1-acc692289e3d",
                code: "http_output",
                name: "HTTP Output",
                group: "Comunicaciones",
                handles: "in",
                defaults:
                    '{\n    "protocol": "http",\n    "hostname": "127.0.0.1",\n    "path": "",\n    "port": 8787\n}',
                form_type: "jsonschema",
                node_type: "node",
                plugin_id: null,
                description: "Message Output via HTTP",
                json_ui_schema:
                    '{\n    "hostname": {\n        "ui:columnSize": "4"\n    },\n    "port": {\n        "ui:columnSize": "3"\n    },\n    "path": {\n        "ui:columnSize": "3"\n    }\n}',
                json_data_schema:
                    '{\n    "description": "HTTP Client",\n    "type": "object",\n    "required": [\n        "label",\n        "hostname",\n        "port"\n    ],\n    "properties": {\n        "label": {\n            "type": "string"\n        },\n        "hostname": {\n            "title": "Host",\n            "type": "string"\n        },\n        "path": {\n            "title": "Ruta",\n            "type": "string"\n        },\n        "port": {\n            "title": "Puerto",\n            "type": "number"\n        },\n        "query_params": {\n            "title": "Parámetros",\n            "type": "array",\n            "items": {\n                "type": "object",\n                "required": [\n                    "code",\n                    "value"\n                ],\n                "properties": {\n                    "code": {\n                        "title": "Clave",\n                        "type": "string"\n                    },\n                    "value": {\n                        "title": "Valor",\n                        "type": "string"\n                    }\n                }\n            }\n        }\n    }\n}',
                camel_component_id: "1e2cd28f-7f6f-40de-a153-d716c2e4bd2b",
                form_type_plugin_id: null,
                react_component_type: "output",
            },
        },
        {
            id: "e0a4f9f7-0d4b-4fd4-a500-dc944b17f241",
            document_type: "node_type",
            code: "log",
            data: {
                id: "e0a4f9f7-0d4b-4fd4-a500-dc944b17f241",
                code: "log",
                name: "Log",
                group: "Utilidades",
                handles: "in",
                defaults: '{\n    "name": "debug"\n}',
                form_type: "jsonschema",
                node_type: "node",
                plugin_id: null,
                description: "Output message",
                json_ui_schema: "{}",
                json_data_schema:
                    '{\n    "title": "Log",\n    "description": "Output message",\n    "type": "object",\n    "required": [\n        "label",\n        "name"\n    ],\n    "properties": {\n        "label": {\n            "type": "string"\n        },\n        "name": {\n            "type": "string"\n        }\n    }\n}',
                camel_component_id: "5eb79d2d-5b7d-4666-83b2-9c0abb80f569",
                form_type_plugin_id: null,
                react_component_type: "output",
            },
        },
        {
            id: "3273507b-d3de-4e6d-93c6-bd612b3e9fc9",
            document_type: "node_type",
            code: "loop",
            data: {
                id: "3273507b-d3de-4e6d-93c6-bd612b3e9fc9",
                code: "loop",
                name: "Loop",
                group: "Flujo",
                defaults:
                    '{\n    "count": 0,\n    "handles": [\n        {\n            "id": "out0",\n            "to": "",\n            "title": "Iteraciones",\n            "color": "blue"\n        },\n        {\n            "id": "out1",\n            "to": "",\n            "title": "Fin búcle",\n            "color": "red"\n        }\n    ]\n}',
                json_ui_schema: "{}",
                json_data_schema:
                    '{\n    "title": "Loop",\n    "type": "object",\n    "required": [\n        "label",\n        "count"\n    ],\n    "properties": {\n        "label": {\n            "type": "string"\n        },\n        "count": {\n            "type": "number"\n        }\n    }\n}',
                camel_component_id: "1ea0f437-0e74-4ffa-b64e-7f75781178cb",
                react_component_type: "MultiTargetNode",
            },
        },
        {
            id: "5031a614-6f8c-4419-99d1-fcc5d6786ffe",
            document_type: "node_type",
            code: "switch",
            data: {
                id: "5031a614-6f8c-4419-99d1-fcc5d6786ffe",
                code: "switch",
                name: "Switch",
                group: "Flujo",
                handles: "",
                defaults:
                    '{\n    "language": "simple",\n    "handles": [\n        {\n            "id": "out0",\n            "condition": "a == b",\n            "to": ""\n        }\n    ]\n}',
                form_type: "jsonschema",
                node_type: "node",
                plugin_id: null,
                description: "Create dynamic condition",
                json_ui_schema: "{}",
                json_data_schema:
                    '{\n    "title": "Switch Node",\n    "description": "Create dynamic conditions",\n    "type": "object",\n    "required": [\n        "label",\n        "handles"\n    ],\n    "properties": {\n        "label": {\n            "type": "string"\n        },\n        "language": {\n            "type": "string"\n        },\n        "handles": {\n            "type": "array",\n            "items": {\n                "type": "object",\n                "properties": {\n                    "condition": {\n                        "type": "string"\n                    }\n                }\n            }\n        }\n    }\n}',
                camel_component_id: "67d93216-b818-44d2-a82c-5da0a305a94c",
                form_type_plugin_id: null,
                react_component_type: "MultiTargetNode",
            },
        },
        {
            id: "85a901c1-b22b-425e-9c5e-94b87fda528e",
            document_type: "node_type",
            code: "tcp_input",
            data: {
                id: "85a901c1-b22b-425e-9c5e-94b87fda528e",
                code: "tcp_input",
                name: "TCP/MLLP Input",
                group: "Comunicaciones",
                handles: "out",
                defaults: '{\n    "protocol": "mllp",\n    "hostname": "0.0.0.0",\n    "port": 8888\n}',
                form_type: "jsonschema",
                node_type: "node",
                plugin_id: null,
                description: "Message Input via TCP-MLLP Connection",
                json_ui_schema:
                    '{\n    "protocol": {\n        "ui:columnSize": "4"\n    },\n    "hostname": {\n        "ui:columnSize": "4"\n    },\n    "port": {\n        "ui:columnSize": "4"\n    }\n}',
                json_data_schema:
                    '{\n    "description": "TCP/MLLP Input",\n    "type": "object",\n    "required": [\n        "label",\n        "hostname",\n        "port"\n    ],\n    "properties": {\n        "label": {\n            "type": "string"\n        },\n        "protocol": {\n            "title": "Protocolo",\n            "type": "string",\n            "enum": [\n                "netty:tcp",\n                "mllp"\n            ],\n            "enumNames": [\n                "TCP Netty",\n                "MLLP"\n            ]\n        },\n        "hostname": {\n            "title": "Host",\n            "type": "string"\n        },\n        "port": {\n            "title": "Puerto",\n            "type": "number"\n        },\n        "query_params": {\n            "title": "Parámetros",\n            "type": "array",\n            "items": {\n                "type": "object",\n                "required": [\n                    "code",\n                    "value"\n                ],\n                "properties": {\n                    "code": {\n                        "title": "Clave",\n                        "type": "string"\n                    },\n                    "value": {\n                        "title": "Valor",\n                        "type": "string"\n                    }\n                }\n            }\n        }\n    }\n}',
                camel_component_id: "7662d716-a3da-4e92-9136-da2000fdc8a1",
                form_type_plugin_id: null,
                react_component_type: "input",
            },
        },
        {
            id: "08144afe-6c21-4950-8290-c66075dca1d6",
            document_type: "node_type",
            code: "tcp_output",
            data: {
                id: "08144afe-6c21-4950-8290-c66075dca1d6",
                code: "tcp_output",
                name: "TCP/MLLP Output",
                group: "Comunicaciones",
                handles: "out",
                defaults: '{\n    "protocol": "mllp",\n    "hostname": "0.0.0.0",\n    "port": 8888\n}',
                json_ui_schema:
                    '{\n    "protocol": {\n        "ui:columnSize": "4"\n    },\n    "hostname": {\n        "ui:columnSize": "4"\n    },\n    "port": {\n        "ui:columnSize": "4"\n    }\n}',
                json_data_schema:
                    '{\n    "description": "TCP-MLLP Output",\n    "type": "object",\n    "required": [\n        "label",\n        "hostname",\n        "port"\n    ],\n    "properties": {\n        "label": {\n            "type": "string"\n        },\n        "protocol": {\n            "title": "Protocolo",\n            "type": "string",\n            "enum": [\n                "netty:tcp",\n                "mllp"\n            ],\n            "enumNames": [\n                "TCP Netty",\n                "MLLP"\n            ]\n        },\n        "hostname": {\n            "title": "Host",\n            "type": "string"\n        },\n        "port": {\n            "title": "Puerto",\n            "type": "number"\n        },\n        "query_params": {\n            "title": "Parámetros",\n            "type": "array",\n            "items": {\n                "type": "object",\n                "required": [\n                    "code",\n                    "value"\n                ],\n                "properties": {\n                    "code": {\n                        "title": "Clave",\n                        "type": "string"\n                    },\n                    "value": {\n                        "title": "Valor",\n                        "type": "string"\n                    }\n                }\n            }\n        }\n    }\n}',
                camel_component_id: "1e2cd28f-7f6f-40de-a153-d716c2e4bd2b",
                react_component_type: "output",
            },
        },
        {
            id: "648bbb89-aa93-4392-8377-bca3b2c19548",
            document_type: "node_type",
            code: "terser_extractor",
            data: {
                id: "648bbb89-aa93-4392-8377-bca3b2c19548",
                code: "terser_extractor",
                name: "Terser Extractor",
                group: "Utilidades",
                handles: "in,out",
                defaults: '{\n    "language": "hl7terser",\n    "code": "/.ORC-2"\n}',
                form_type: "jsonschema",
                node_type: "node",
                plugin_id: null,
                description: "Replaces route Body with HL7 property via terser Path",
                json_ui_schema: "{}",
                json_data_schema:
                    '{\n    "title": "Terser Extractor",\n    "description": "Replaces route Body with HL7 property via terser Path",\n    "type": "object",\n    "required": [\n        "label",\n        "terser_path"\n    ],\n    "properties": {\n        "label": {\n            "type": "string"\n        },\n        "code": {\n            "type": "string"\n        }\n    }\n}',
                camel_component_id: "fdfe4184-2879-4670-ad4c-33b939d1906f",
                form_type_plugin_id: null,
                react_component_type: "default",
            },
        },
    ]);
};
