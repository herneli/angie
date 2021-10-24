import { useEffect, useState } from "react";
import { Table } from 'antd';
import axios from 'axios';
import * as xmlformat from 'xml-formatter'

const Integrations = () => {
    let [dataSource, setDataSource] = useState([]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description'
        }
    ];
    const form = {
        schema: {
            "title": "Camel Component",
            "type": "object",
            "required": [
                "name",
                "xml_template"
            ],
            "properties": {
                "name": {
                    "type": "string"
                },
                "xml_template": {
                    "type": "string"
                },
                "options": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "string"
                    }
                }

            }
        },
        uiSchema: {
            "xml_template": { "ui:widget": "textarea" },
            "options": { "ui:widget": "textarea" }
        }
    };

    const search = async (filters = {}) => {
        const response = await axios.post('/integration/list', filters);

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

    return (
        <Table dataSource={dataSource} columns={columns} />
    )
}


export default Integrations;