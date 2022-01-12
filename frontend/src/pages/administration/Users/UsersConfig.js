import { mdiAccountGroup, mdiAxisLock, mdiConnection, mdiDelete, mdiPalette, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { Layout, Menu, Space, Tag, Table, Button, Popconfirm, Modal, Divider, Input } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ModelAdmin from "../../configuration/ModelAdmin";

const UsersConfig = () => {
    const [loading, setLoading] = useState(false);

    const importUsers = async () => {
        setLoading(true);
        try {
            await axios({
                method: "post",
                url: `/importUsers`,
            });
        } catch (ex) {
            console.error(ex);
        }
        setLoading(false);
    };

    return (
        <>
            <Popconfirm onConfirm={importUsers}>
                <Button style={{ display: "flex", float: "right", marginLeft: "1.5%" }} type="primary">
                    Importar Usuarios
                </Button>
            </Popconfirm>

            {!loading && <ModelAdmin model="users" />}
            {loading && <div>Realizando importación...</div>}
        </>
    );
};
export default UsersConfig;
