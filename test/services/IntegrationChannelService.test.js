import { expect } from "chai";
import { getTracker } from "knex-mock-client";
import { IntegrationChannelService } from "../../app/server/api/integration_channel";

const channel = {
    name: "Channel",
    id: "116a6189-b3a4-42ff-a6c9-96c371e983ce",
    created_on: "2021-12-15T10:18:35.409Z",
    version: 7,
    nodes: [
        {
            id: "a36834f3-397d-4582-bf19-aa02203ac712",
            type_id: "core.utils.log",
            position: {
                x: 712,
                y: 263,
            },
            data: {
                label: "Log",
                name: "debug",
            },
            links: [],
        },
        {
            id: "3f5effce-d8c0-4f07-b011-3f4e7ac7db14",
            type_id: "core.utils.debug",
            position: {
                x: 299,
                y: 265,
            },
            data: {
                label: "Debug",
                channel_id: "116a6189-b3a4-42ff-a6c9-96c371e983ce",
                channel_status: "UNDEPLOYED",
            },
            links: [
                {
                    node_id: "a36834f3-397d-4582-bf19-aa02203ac712",
                    handle: null,
                },
            ],
        },
    ],
    options: {
        trace_file: true,
        trace_incoming_message: false,
        trace_headers: false,
        trace_properties: false,
        trace_outgoing_message: false,
    },
    enabled: true,
    status: "UNDEPLOYED",
    last_updated: "2021-12-15T10:19:06.470Z",
};


const config_node_type = {
    name: "Tipos de Nodo",
    code: "node_type",
    data: {
        code: "node_type",
        name: "Tipos de Nodo",
        table: "integration_config",
        id_mode: "uuid",
        documentType: "node_type",
    },
};

const node_types = [
    {
        id: "fa6b5212-a518-49f8-8867-c965473ac4d0",
        code: "core.utils.debug",
        data: {
            id: "fa6b5212-a518-49f8-8867-c965473ac4d0",
            code: "core.utils.debug",
            name: "Debug",
            group: "Utilidades",
            handles: "in,out",
            defaults: "{}",
            json_ui_schema: "{}",
            json_data_schema:
                '{\n    "type": "object",\n    "properties": {\n        "name": {\n            "type": "string"\n        }\n    }\n}',
            xml_template:
                '<route id="{{source}}">\n    <from uri="direct:{{source}}"/>\n    <bean ref="debugBean" method="debug" />\n    <multicast>\n        {{#each target}}\n        <to uri="direct:{{this}}"/>\n        {{/each}}\n    </multicast>\n</route>',
            react_component_type: "default",
        },
    },
    {
        id: "e0a4f9f7-0d4b-4fd4-a500-dc944b17f241",
        code: "core.utils.log",
        data: {
            id: "e0a4f9f7-0d4b-4fd4-a500-dc944b17f241",
            code: "core.utils.log",
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
            xml_template: '<route  id="{{source}}"> <from uri="direct:{{source}}"/> <to uri="log:{{name}}"/> </route>',
            form_type_plugin_id: null,
            react_component_type: "output",
        },
    },
];
describe("IntegrationChannelService", async () => {
    let tracker;

    before(() => {
        tracker = getTracker();

        tracker.on
            .select(({ sql, bindings }) => {
                return sql.indexOf("config_model") !== -1 && bindings[0] === "node_type";
            })
            .response([config_node_type]);
            
        tracker.on
            .select(({ sql, bindings }) => {
                return sql.indexOf("integration_config") !== -1 && bindings[0] === "node_type";
            })
            .response(node_types);
    });

    // afterEach(() => {
    //     tracker.reset();
    // });

    it("#convertChannelToCamel()", async () => {
        let service = new IntegrationChannelService();

        let route = await service.convertChannelToCamel(channel);

        expect(route).not.to.be.null;

        expect(route).to.be.eq(
            '<routes xmlns="http://camel.apache.org/schema/spring"><route  id="a36834f3-397d-4582-bf19-aa02203ac712"> <from uri="direct:a36834f3-397d-4582-bf19-aa02203ac712"/> <to uri="log:debug"/> </route><route id="3f5effce-d8c0-4f07-b011-3f4e7ac7db14">\n    <from uri="direct:3f5effce-d8c0-4f07-b011-3f4e7ac7db14"/>\n    <bean ref="debugBean" method="debug" />\n    <multicast>\n        <to uri="direct:a36834f3-397d-4582-bf19-aa02203ac712"/>\n    </multicast>\n</route></routes>'
        );
    });
});
