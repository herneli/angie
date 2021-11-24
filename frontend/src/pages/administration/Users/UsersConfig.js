import { mdiAccountGroup, mdiAxisLock, mdiConnection, mdiDelete, mdiPalette, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { Layout, Menu, Space, Tag, Table, Button, Popconfirm, Modal, Divider, Input } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ModelAdmin from "../../configuration/ModelAdmin";

const UsersConfig = () => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({});
    const [paramsPagination, setParamsPagination] = useState({ limit: 10, start: 0 });
    const [editModal, setEditModal] = useState(false);

    //Paginación
    useEffect(() => {
        setParamsPagination({
            limit: paramsPagination.pageSize,
            start: paramsPagination.start * paramsPagination.pageSize,
        });
    }, [pagination]);

    const search = async (params) => {
        const response = await axios({
            method: "post",
            url: `/user/list`,
            data: paramsPagination,
        });
        setData(response.data.data);

        if (params?.pageSize && params?.current) {
            setParamsPagination({ limit: params.pageSize, start: params.current });
        }
        setPagination({ total: response.data.total, showSizeChanger: true });
    };

    useEffect(() => {
        search();
    }, []);

    const importUsers = async () => {
        const response = await axios({
            method: "post",
            url: `/importUsers`,
        });
        search();
    };

    return (
        <>
            <Popconfirm onConfirm={importUsers}>
                <Button style={{ display: "flex", float: "right", marginLeft: "1.5%" }} type="primary">
                    Importar Usuarios
                </Button>
            </Popconfirm>

            <ModelAdmin model="users_config" />
        </>
    );
};
export default UsersConfig;
