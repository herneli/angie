import { mdiAccountGroup, mdiConnection, mdiPalette } from "@mdi/js";
import Icon from "@mdi/react";
import { Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import SubMenu from "antd/lib/menu/SubMenu";
import T from "i18n-react";
import MenuHandler from "../../common/MenuHandler";

const AdminSubMenu = (props) => {
    const { Sider } = Layout;
    const { SubMenu } = Menu;
    const { keycloak } = useKeycloak();
    const [menu, setMenu] = useState([]);
    const [paintedMenu, setPaintedMenu] = useState([]);

    const icons = {
        mdiAccountGroup: mdiAccountGroup,
        mdiConnection: mdiConnection,
        mdiPalette: mdiPalette,
    };

    const getSubMenu = async () => {
        if (props.parent) {
            let data =  await MenuHandler.drawSubMenu(props.parent,null,keycloak.tokenParsed.sub)
            setPaintedMenu(data)
        }
    };

    useEffect(() => {
        getSubMenu();
    }, []);

    return (
        <Sider width={200} className="adm-submenu">
            <Menu
                mode="inline"
                defaultOpenKeys={["Gestión", "Comunicaciones", "Personalización"]}
                style={{ height: "100%", borderRight: 0 }}>
                {paintedMenu}
            </Menu>
        </Sider>
    );
};
export default AdminSubMenu;
