import { mdiAccountGroup, mdiAxisLock, mdiConnection, mdiDelete, mdiPalette, mdiPencil } from '@mdi/js';
import Icon from '@mdi/react';
import { Layout, Menu, Space, Tag, Table, Button, Popconfirm, Modal, Divider, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import AdmTable from '../administration/generic/AdmTable';


const UsersConfig = () => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({})
    const [paramsPagination, setParamsPagination] = useState({ limit: 10, start: 1 })
    const [editModal, setEditModal] = useState(false)

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'ID',
        },
        {
            title: 'username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'organization_id',
            dataIndex: 'organization_id',
            key: 'organization_id',
        },
        {
            title: 'created_time_stamp',
            dataIndex: 'created_time_stamp',
            key: 'created_time_stamp',
        },
        {
            title: 'roles',
            dataIndex: 'roles',
            key: 'roles',
            render: roles => {
                var str = ""
                roles.realmMappings.forEach(element => {
                    str += element.name + ","
                });

                return str;
            },
        }
    ]

    const openEditModal = (record) => {

        setEditModal(true)
    }


    //Paginación
    useEffect(() => {
        setParamsPagination({
            limit: paramsPagination.pageSize,
            start: paramsPagination.start * paramsPagination.pageSize
        })
    }, [pagination])



    const search = async (params) => {
        const response = await axios({
            method: "post",
            url: `http://localhost:3105/user/list`,
            data: paramsPagination
        });
        setData(response.data.data);

        if (params?.pageSize && params?.current) {
            setParamsPagination({ limit: params.pageSize, start: params.current })
        }
        setPagination({ total: response.data.total, showSizeChanger: true })

    }

    useEffect(() => {
        search();
    }, [])


    const importUsers = async () => {
        const response = await axios({
            method: "post",
            url: `http://localhost:3105/importUsers`,
        })
        search();
    }


    const saveUser = async (params) => {
        const response = await axios({
            method: "post",
            url: `http://localhost:3105/saveUser`,
            data: params,
        })
        search();
    }

    const form = {
        schema: {
            "title": "Add User",
            "type": "object",
            "required": [
                "username",
            ],
            "properties": {
                "username": {
                    "type": "string"
                },
                "email": {
                    "type": "string"
                },
                "organization_id": {
                    "type": "string",
                    "enum":["foo","bar"]
                }

            }
        },
        uiSchema: {

        }
    };

    return (
        <>
        
    
            <Popconfirm onConfirm={importUsers}>
                <Button style={{ display:'flex', float: 'right',marginBottom: "1.5%" }} type="primary">Importar Usuarios</Button>
            </Popconfirm>
            
            <AdmTable style={{ margin: "0 0 0 0 " }}
                dataSource={data}
                onChange={search}
                form={form}
                pagination={pagination}
                // enableEdit
                // enableDelete
                enableAdd
                onElementEdit={saveUser}
                onElementDelete={{}}
                columns={columns} />
            {/* 
             <Modal
                title="Basic Modal"
                visible={editModal}
                onOk={{}}
                onCancel={() => setEditModal(false)}
                >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
                </Modal> */}
        </>
    )
}
export default UsersConfig