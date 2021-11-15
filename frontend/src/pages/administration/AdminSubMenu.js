import { mdiAccountGroup, mdiConnection, mdiPalette } from "@mdi/js";
import Icon from "@mdi/react";
import { Layout, Menu } from "antd";
import React from "react";
import { Link } from "react-router-dom";

const AdminSubMenu = () => {
    const { Sider } = Layout;
    const { SubMenu } = Menu;
    return (
        <Sider width={200} className="adm-submenu">
            <Menu mode="inline" defaultOpenKeys={["gest", "comm", "custom"]} style={{ height: "100%", borderRight: 0 }}>
                <SubMenu key="gest" icon={<Icon path={mdiAccountGroup} size={1} />} title="Gestión">
                    <Menu.Item key="1">
                        <Link to="/admin/users">Usuarios </Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <Link to="/admin/profiles">Perfiles </Link>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <Link to="/admin/organization">Organizaciones </Link>
                    </Menu.Item>
                </SubMenu>
                <SubMenu key="comm" icon={<Icon path={mdiConnection} size={1} />} title="Comunicaciones">
                    <Menu.Item key="integ">
                        <Link to="/admin/integration">Integraciones </Link>
                    </Menu.Item>
                    <Menu.Item key="ntypes">
                        <Link to="/admin/node_type">Tipos Nodos </Link>
                    </Menu.Item>
                    <Menu.Item key="ccompo">
                        <Link to="/admin/camel_component">Componentes Camel </Link>
                    </Menu.Item>
                </SubMenu>
                <SubMenu key="custom" icon={<Icon path={mdiPalette} size={1} />} title="Personalización">
                    <Menu.Item key="config_context">
                        <Link to="/admin/config_context">Contextos</Link>
                    </Menu.Item>
                    <Menu.Item key="config_method">
                        <Link to="/admin/config_method">Métodos </Link>
                    </Menu.Item>
                    <Menu.Item key="config_object">
                        <Link to="/admin/config_object">Objetos</Link>
                    </Menu.Item>
                    <Menu.Item key="script">
                        <Link to="/admin/script/test_groovy">Script</Link>
                    </Menu.Item>
                </SubMenu>
            </Menu>
        </Sider>
    );
};
export default AdminSubMenu;
