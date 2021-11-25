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
        if (item.children) {
            return drawSubMenu(item, sections);
        }
        return (
            <Menu.Item key={item.value}>
                <Link to={item.value}>{T.translate(item.title)}</Link>
            </Menu.Item>
        );
    };

    const drawSubMenu = (item, sections) => {
        let submenu = [];
        for (let idx in item.children) {
            let child = item.children[idx];
            if(sections.indexOf(item.value) > -1){
                submenu.push(drawMenuItem(child, sections));
            }else if (sections.indexOf(child.value) > -1) {
                submenu.push(drawMenuItem(child, sections));
            }
        }
        if(submenu.length > 0){
            return (
                <SubMenu key={item.title} icon={<Icon path={icons[item.icon]} size={1} />} title={item.title}>
                    {submenu}
                </SubMenu>
            );
        }
    };

    const drawMenu = async () => {
        let finalMenu = [];
        let menuElements = [
            {
                title: "Gestión",
                icon: "mdiAccountGroup",
                value: "/admin/gestion",
                children: [
                    { value: "/admin/users", title: T.translate("administration.users") },
                    { value: "/admin/profiles", title: T.translate("administration.profiles") },
                    { value: "/admin/organization", title: T.translate("administration.organization") },
                ],
            },
            {
                title: "Comunicaciones",
                icon: "mdiConnection",
                value: "/admin/comunicaciones",
                children: [
                    { value: "/admin/integration", title: T.translate("administration.integration") },
                    { value: "/admin/node_type", title: T.translate("administration.node_type") },
                    { value: "/admin/camel_component", title: T.translate("administration.camel_component") },
                ],
            },
            {
                title: "Personalización",
                icon: "mdiPalette",
                value: "/admin/personalization",
                children: [
                    { value: "/admin/config_context", title: T.translate("administration.config_context") },
                    { value: "/admin/config_method", title: T.translate("administration.config_method") },
                    { value: "/admin/config_object", title: T.translate("administration.config_object") },
                    { value: "/admin/script/test_groovy", title: T.translate("administration.test_groovy") },
                ],
            }
        ];

        const resp = await checkAllowedSections();
        let sections = [];
        if (resp && resp.data && resp.data.data && resp.data.data[0].data && resp.data.data[0].data.sections) {
            sections = resp.data.data[0].data.sections;
        }
        if (keycloak.tokenParsed.roles && keycloak.tokenParsed.roles.includes("admin")) {
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
            finalMenu.push(drawMenuItem(item, sections));
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
