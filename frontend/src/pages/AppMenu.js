import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from "react";
import { Menu } from "antd";
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
                    <Menu.Item key="config">
                        <Link to="./config">Configuration </Link>
                    </Menu.Item>
                </>
            )}

            {keycloak && !keycloak.authenticated && (
                <Menu.Item
                    key="login"
                    className="rightFloated"
                    icon={<UserOutlined />}
                >
                    <a className="btn-link" onClick={() => keycloak.login()}>
                        Login
                    </a>
                </Menu.Item>
            )}

            {keycloak && keycloak.authenticated && (
                <Menu.Item
                    key="logout"
                    className="rightFloated"
                    icon={<UserOutlined />}
                >
                    <a className="btn-link" onClick={() => keycloak.logout()}>
                        Logout ({keycloak.tokenParsed.preferred_username})
                    </a>
                </Menu.Item>
            )}
        </Menu>
    );
};

export default AppMenu;
