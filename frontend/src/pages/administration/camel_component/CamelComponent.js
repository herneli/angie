import { useEffect, useState } from "react";
import AdmTable from "../generic/AdmTable";
import axios from 'axios';
import * as xmlformat from 'xml-formatter'

const CamelComponents = () => {
    let [dataSource, setDataSource] = useState([]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '10%'
        },
        {
            title: 'Template',
            dataIndex: 'xml_template',
            key: 'xml_template',
            width: '30%',
            render: text => <pre style={{ overflow: 'hidden', width: 300 }}>{xmlformat(text)}</pre>,
        },
        {
            title: 'Options',
            dataIndex: 'options',
            key: 'options',
            render: text => <pre>{JSON.stringify(text, null, 2)}</pre>,
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
        const response = await axios.post('/camel_component/list', filters);

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
        <AdmTable dataSource={dataSource} columns={columns} form={form} enableEdit enableDelete enableAdd onElementEdit={onElementEdit} />
    )
}


export default CamelComponents;