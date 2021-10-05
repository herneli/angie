const node_types = [
    {
        "id": "85a901c1-b22b-425e-9c5e-94b87fda528e",
        "name": "TCP-MLLP Input",
        "description": "Message Input via TCP-MLLP Connection",
        "node_type": "node",
        "react_component_type": "input",
        "camel_component_id": "7662d716-a3da-4e92-9136-da2000fdc8a1",
        "plugin_id": null,
        "handles": [
            "out"
        ],
        "form_type": "jsonschema",
        "form_type_plugin_id": null,
        "json_data_schema": {
            "title": "TCP-MLLP Input",
            "description": "MLLP tcp input node.",
            "type": "object",
            "required": [
                "hostname",
                "port"
            ],
            "properties": {
                "hostname": {
                    "type": "string"
                },
                "port": {
                    "type": "number"
                },
                "query_params": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "string"
                    }
                }
            }
        },
        "json_ui_schema": {},
        "defaults": {
            "hostname": "0.0.0.0",
            "port": 8888
        }
    },
    {
        "id": "a97136c1-68b6-4b97-b6b1-acc692289e3d",
        "name": "HTTP Output",
        "description": "Message Output via HTTP",
        "node_type": "node",
        "react_component_type": "output",
        "camel_component_id": "1e2cd28f-7f6f-40de-a153-d716c2e4bd2b",
        "plugin_id": null,
        "handles": [
            "in"
        ],
        "form_type": "jsonschema",
        "form_type_plugin_id": null,
        "json_data_schema": {
            "title": "HTTP Input",
            "description": "Simple HTTP output node.",
            "type": "object",
            "required": [
                "hostname",
                "port"
            ],
            "properties": {
                "hostname": {
                    "type": "string"
                },
                "port": {
                    "type": "number"
                },
                "path": {
                    "type": "string"
                },
                "query_params": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "string"
                    }
                }
            }
        },
        "json_ui_schema": {},
        "defaults": {
            "hostname": "127.0.0.1",
            "port": 8787
        }
    },
    {
        "id": "35f0048c-2805-4e36-95cb-1369a109e845",
        "name": "Terser Extractor",
        "description": "Replaces route Body with HL7 property via terser Path",
        "node_type": "node",
        "react_component_type": "default",
        "camel_component_id": "67d93206-b818-44d2-a82c-5da0a305a94c",
        "plugin_id": null,
        "handles": [
            "in",
            "out"
        ],
        "form_type": "jsonschema",
        "form_type_plugin_id": null,
        "json_data_schema": {
            "title": "Terser Extractor",
            "description": "Replaces route Body with HL7 property via terser Path",
            "type": "object",
            "required": [
                "teser_path"
            ],
            "properties": {
                "terser_path": {
                    "type": "string"
                }
            }
        },
        "json_ui_schema": {},
        "defaults": {
            "terser_path": "/.ORC-2"
        }
    },
    {
        "id": "35f0043438c-2805-4e36-95cb-1369a109e845",
        "name": "Switch",
        "description": "Create dynamic condition",
        "node_type": "node",
        "react_component_type": "switchNode",
        "camel_component_id": "67d93216-b818-44d2-a82c-5da0a305a94c",
        "plugin_id": null,
        "form_type": "jsonschema",
        "form_type_plugin_id": null,
        "json_data_schema": {
            "title": "Switch Node",
            "description": "Create dynamic conditions",
            "type": "object",
            "required": [
                "handles"
            ],
            "properties": {
                "handles": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "condition": {
                                "type": "string"
                            }
                        }
                    }
                }
            }
        },
        "json_ui_schema": {},
        "defaults": {
            "handles": [
                {
                    "id": "out0",
                    "condition": "a == b",
                    "to": "10b91fc9-1ac5-4ce2-9c80-eb8a63d35c22"
                }
            ]
        }
    },
    {
        "id": "e0a4f9f7-0d4b-4fd4-a500-dc944b17f241",
        "name": "Log",
        "description": "Output message",
        "node_type": "node",
        "react_component_type": "output",
        "camel_component_id": "5eb79d2d-5b7d-4666-83b2-9c0abb80f569",
        "plugin_id": null,
        "handles": [
            "in"
        ],
        "form_type": "jsonschema",
        "form_type_plugin_id": null,
        "json_data_schema": {
            "title": "Log",
            "description": "Output message",
            "type": "object",
            "required": [
                "name"
            ],
            "properties": {
                "name": {
                    "type": "string"
                }
            }
        },
        "json_ui_schema": {},
        "defaults": {
            "name": "debug"
        }
    },
    {
        "id": "50b890b5-a309-4b7c-9fa0-5c8b23b25c6f",
        "name": "Groovy Code",
        "description": "Replaces body by custom groovy code",
        "node_type": "node",
        "react_component_type": "default",
        "camel_component_id": "fdfe4184-2879-4670-ad4c-33b939d1906f",
        "plugin_id": null,
        "handles": [
            "in",
            "out"
        ],
        "form_type": "jsonschema",
        "form_type_plugin_id": null,
        "json_data_schema": {
            "title": "Groovy Code",
            "description": "Replaces body by custom groovy code",
            "type": "object",
            "required": [
                "code"
            ],
            "properties": {
                "code": {
                    "type": "string"
                }
            }
        },
        "json_ui_schema": {
            "code": { "ui:widget": "textarea" }
        },
        "defaults": {
            "code": ""
        }
    },
]
export default node_types;