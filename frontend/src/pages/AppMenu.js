import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from "react";
import { Button, Menu } from "antd";
import { Link } from "react-router-dom";
import AuthorizedFunction from "../layout/AuthorizedFunction";

import {
    HomeOutlined,
    BranchesOutlined,
    UserOutlined,
} from "@ant-design/icons";

const AppMenu = () => {
    const { keycloak } = useKeycloak();
    const [selected, changeSelection] = useState(null);

    return (
        <Menu
            onClick={(e) => changeSelection(e.key)}
            selectedKeys={[selected]}
            mode="horizontal"
        >
            <Menu.Item key="home" icon={<HomeOutlined />}>
                <Link to="./">Home Page </Link>
            </Menu.Item>
            {AuthorizedFunction(["default-roles-angie"]) && (
                <>
                    <Menu.Item key="drag" icon={<BranchesOutlined />}>
                        <Link to="./drag">Drag </Link>
                    </Menu.Item>
                    <Menu.Item key="config_method">
                        <Link to="./config_method">Métodos </Link>
                    </Menu.Item>
                    <Menu.Item key="config_object">
                        <Link to="./config_object">Objetos</Link>
                    </Menu.Item>
                    <Menu.Item key="script">
                        <Link to="./script">Script</Link>
                    </Menu.Item>
                </>
            )}

            {keycloak && !keycloak.authenticated && (
                <Menu.Item
                    key="login"
                    className="rightFloated"
                    icon={<UserOutlined />}
                    onClick={() => keycloak.login()}
                >
                    Login
                </Menu.Item>
            )}

            {keycloak && keycloak.authenticated && (
                <Menu.Item
                    key="logout"
                    className="rightFloated"
                    icon={<UserOutlined />}
                    onClick={() => keycloak.logout()}
                >
                    Logout ({keycloak.tokenParsed.preferred_username})
                </Menu.Item>
            )}
        </Menu>
    );
};

export default AppMenu;
