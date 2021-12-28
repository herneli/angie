import { Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import MenuHandler from "../../common/MenuHandler";

const submenu = {
    title: "Gestión",
    icon: "mdiAccountGroup",
    value: "/admin/gestion",
    children: [
        { value: "/admin/users", icon: "mdiAccount", title: "administration.users" },
        { value: "/admin/sections", icon: "mdiLock", title: "administration.sections" },
        {
            value: "/admin/organization",
            icon: "mdiOfficeBuilding",
            title: "administration.organization",
        },
    ],
};

const AdminSubMenu = ({ parent }) => {
    const { Sider } = Layout;
    const { keycloak } = useKeycloak();
    const [paintedMenu, setPaintedMenu] = useState([]);

    const getSubMenu = async () => {
        if (parent && keycloak && keycloak.tokenParsed && keycloak.tokenParsed.sub) {
            let data = await MenuHandler.drawSubMenu({ children: [submenu] }, null, keycloak.tokenParsed.sub);
            setPaintedMenu(data);
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
