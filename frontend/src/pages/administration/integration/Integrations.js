import { useEffect, useState } from "react";
import { Button, Space, Table } from 'antd';
import axios from 'axios';
import * as xmlformat from 'xml-formatter'


import Routes from './Channel';
import { useHistory } from "react-router";

const Integrations = () => {
    let [dataSource, setDataSource] = useState([]);
    let history = useHistory();



    const startEdit = (record) => {
        history.push({
            pathname: '/admin/integration/' + record.id,
            state: {
                record: record
            }
        });
    }

    const onElementDelete = (record) => {

    }


    const search = async (filters = {}) => {
        const response = await axios.post('/integration/list/full', filters);

        if (response && response.data && response.data.data) {
            setDataSource(response.data.data);
        }
    }

    useEffect(() => {
        search();
    }, []);


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
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            render: (text, record) => (
                <Space size="middle">
                    <Button type='link' onClick={() => startEdit(record)}> Editar</Button>
                    <Button type='link' onClick={() => onElementDelete(record)}> Borrar</Button>
                </Space >
            ),
        }
    ];

    return (
        <Table dataSource={dataSource} columns={columns} />
        // <Routes /> 
    )
}


export default Integrations;