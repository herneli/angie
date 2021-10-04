const camel_components = [
    {
        "id": "7662d716-a3da-4e92-9136-da2000fdc8a1",
        "name": "TCP Input",
        "xml_template": "<route> <from uri=\"mllp://{{hostname}}:{{port}}{{querystring query_params}}\"/> {{#each target}} <to uri=\"direct:{{this.node_id}}\"/> {{/each}}</route>",
        "options": {
            "target": "string",
            "hostname": "string",
            "port": "number",
            "query_params": "array"
        }
    },
    {
        "id": "1e2cd28f-7f6f-40de-a153-d716c2e4bd2b",
        "name": "HTTP Output",
        "xml_template": "<route> <from uri=\"direct:{{source}}\"/> <to uri=\"http://{{hostname}}:{{port}}/{{path}}{{querystring query_params}}\"/> </route>",
        "options": {
            "source": "string",
            "hostname": "string",
            "port": "number",
            "path": "string",
            "query_params": "array"
        }
    },
    {
        "id": "67d93206-b818-44d2-a82c-5da0a305a94c",
        "name": "Terser Body Replacer",
        "xml_template": "<route> <from uri=\"direct:{{source}}\"/> <setBody>  <hl7terser>{{terser_path}}</hl7terser>    </setBody>{{#each target}} <to uri=\"direct:{{this.node_id}}\"/> {{/each}} </route>",
        "options": {
            "source": "string",
            "target": "string",
            "terser_path": "string"
        }
    },
    {
        "id": "67d93216-b818-44d2-a82c-5da0a305a94c",
        "name": "SwitchNode",
        "xml_template": "<route> <from uri=\"direct:{{source}}\"/><choice>  {{#each handles}}    <when><simple>{{safe this.condition}}</simple>    {{#each this.to}} <to uri=\"direct:{{this.node_id}}\"/> {{/each}} </when>  {{/each}}\n</choice></route>",
        "options": {
            "handles": "array"
        }
    },
    {
        "id": "5eb79d2d-5b7d-4666-83b2-9c0abb80f569",
        "name": "Log",
        "xml_template": "<route> <from uri=\"direct:{{source}}\"/> <to uri=\"log:{{name}}\"/> </route>",
        "options": {
            "name": "string"
        }
    },

]

export default camel_components;