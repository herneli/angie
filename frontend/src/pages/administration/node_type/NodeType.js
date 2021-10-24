import { useEffect, useState } from "react";
import AdmTable from "../generic/AdmTable";
import axios from 'axios';

const NodeTypes = () => {
    let [dataSource, setDataSource] = useState([]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Component Type',
            dataIndex: 'react_component_type',
            key: 'react_component_type'
        },
        {
            title: 'Handles',
            dataIndex: 'handles',
            key: 'handles',
        }
    ];
    const form = {
        schema: {
            "title": "Camel Component",
            "type": "object",
            "required": [
                "name",
                "react_component_type"
            ],
            "properties": {
                "name": {
                    "type": "string"
                },
                "react_component_type": {
                    "type": "string"
                },
                "handles": {
                    "type": "string"
                },
                "json_data_schema": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string"
                        },
                        "description": {
                            "type": "string"
                        },
                        "type": {
                            "type": "string"
                        },
                        "required": {
                            "type": "string"
                        },
                        "properties": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "string"
                            }
                        }
                    }
                },
                "json_ui_schema": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "string"
                    }
                },
                "defaults": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "string"
                    }
                }

            }
        },
        uiSchema: {

        }
    };

    const search = async (filters = {}) => {
        const response = await axios.post('/node_type/list', filters);

        if (response && response.data && response.data.data) {
            setDataSource(response.data.data);
        }
    }

    useEffect(() => {
        search();
    }, []);


    const onElementEdit = (modifiedRecord) => {
        //TODO call api save
    }
    const onElementDelete = (record) => {

    }

    return (
        <AdmTable
            dataSource={dataSource}
            columns={columns}
            form={form}
            enableEdit
            enableDelete
            enableAdd
            onElementEdit={onElementEdit}
            onElementDelete={onElementDelete} />
    )
}


export default NodeTypes;