import { mdiAccountGroup, mdiConnection, mdiPalette } from "@mdi/js";
import Icon from "@mdi/react";
import { Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import T from "i18n-react";

const AdminSubMenu = () => {
    const { Sider } = Layout;
    const { SubMenu } = Menu;
    const { keycloak } = useKeycloak();
    const [paintedMenu, setPaintedMenu] = useState([]);

    const icons = {
        mdiAccountGroup: mdiAccountGroup,
        mdiConnection: mdiConnection,
        mdiPalette: mdiPalette,
    };

    const drawMenuItem = (item, sections) => {
        if (item.children_sections) {
            return drawSubMenu(item, sections);
        }
        return (
            <Menu.Item key={item.url}>
                <Link to={item.url}>{T.translate(item.name)}</Link>
            </Menu.Item>
        );
    };

    const drawSubMenu = (item, sections) => {
        let submenu = [];
        for (let idx in item.children_sections) {
            let child = item.children_sections[idx];
            if (sections.includes(child.url)) {
                submenu.push(drawMenuItem(child, sections));
            }
        }
        return (
            <SubMenu key={item.menu_item} icon={<Icon path={icons[item.icon]} size={1} />} title={item.menu_item}>
                {submenu}
            </SubMenu>
        );
    };

    const drawMenu = async () => {
        let finalMenu = [];
        let menuElements = [
            {
                menu_item: "Gestión",
                icon: "mdiAccountGroup",
                url: "/admin/gestion",
                children_sections: [
                    { url: "/admin/users", name: "administration.users" },
                    { url: "/admin/profiles", name: "administration.profiles" },
                    { url: "/admin/organization", name: "administration.organization" },
                ],
            },
            {
                menu_item: "Comunicaciones",
                icon: "mdiConnection",
                url: "/admin/comunicaciones",
                children_sections: [
                    { url: "/admin/integration", name: "administration.integration" },
                    { url: "/admin/node_type", name: "administration.node_type" },
                    { url: "/admin/camel_component", name: "administration.camel_component" },
                ],
            },
            {
                menu_item: "Personalización",
                icon: "mdiPalette",
                url: "/admin/personalization",
                children_sections: [
                    { url: "/admin/config_context", name: "administration.config_context" },
                    { url: "/admin/config_method", name: "administration.config_method" },
                    { url: "/admin/config_object", name: "administration.config_object" },
                    { url: "/admin/script/test_groovy", name: "administration.test_groovy" },
                ],
            },
        ];

        const resp = await checkAllowedSections();
        let sections = [];
        if (resp && resp.data && resp.data.data && resp.data.data[0].data && resp.data.data[0].data.sections) {
            sections.push(resp.data.data[0].data.sections);
        }
        if (keycloak.tokenParsed.roles.includes("admin")) {
            sections.push("/admin/config_context");
            sections.push("/admin/config_method");
            sections.push("/admin/config_object");
            sections.push("/admin/camel_component");
            sections.push("/admin/node_type");
            sections.push("/admin/integration");
            sections.push("/admin/users");
            sections.push("/admin/profiles");
            sections.push("/admin/organization");
            sections.push("/admin/personalization");
            sections.push("/admin/comunicaciones");
            sections.push("/admin/gestion");
            sections.push("/admin/script/test_groovy");
        }

        for (let idx in menuElements) {
            let item = menuElements[idx];
            if (sections.indexOf(item.url) > -1) {
                finalMenu.push(drawMenuItem(item, sections));
            }
        }

        setPaintedMenu(finalMenu);
    };

    useEffect(() => {
        drawMenu();
    }, []);

    const checkAllowedSections = async () => {
        let id = keycloak.tokenParsed.sub;
        const response = await axios.post("profile/permissions", { id: id });
        return response;
    };

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
