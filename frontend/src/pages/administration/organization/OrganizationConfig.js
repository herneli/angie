import { mdiAccountGroup, mdiAxisLock, mdiConnection, mdiDelete, mdiPalette, mdiPencil } from '@mdi/js';
import Icon from '@mdi/react';
import { Layout, Menu, Space, Tag, Table, Button, Popconfirm, Modal, Divider, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import ModelAdmin from '../../configuration/ModelAdmin';


const OrganizationConfig = () => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({})
    const [paramsPagination, setParamsPagination] = useState({ limit: 10, start: 0 })

  

    //Paginación
    useEffect(() => {
        setParamsPagination({
            limit: paramsPagination.pageSize,
            start: paramsPagination.start * paramsPagination.pageSize
        })
    }, [pagination])



    return (
        <>
        <ModelAdmin model="organization_config" />
        </>
    )
}
export default OrganizationConfig