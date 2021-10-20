import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from "react";
import { Menu, Layout } from "antd";
import { Link } from "react-router-dom";
import AuthorizedFunction from "../components/security/AuthorizedFunction";

import { mdiAccount, mdiHome, mdiSourceBranch } from "@mdi/js";
import Icon from "@mdi/react";

const { Header } = Layout;
const AppMenu = () => {
    const { keycloak } = useKeycloak();
    const [selected, changeSelection] = useState(null);

    return (
        <div>
            <div className="logo" >
                <img alt="logo" src={process.env.PUBLIC_URL + '/logo512.png'} />
            </div>
            <Menu
                onClick={(e) => changeSelection(e.key)}
                selectedKeys={[selected]}
                mode="horizontal"
            >
                <Menu.Item key="home" icon={<Icon path={mdiHome} size={0.6} />}>
                    <Link to="/">Home Page </Link>
                </Menu.Item>
                {AuthorizedFunction(["default-roles-angie"]) && (
                    <>
                        <Menu.Item key="admin" icon={<Icon path={mdiSourceBranch} size={0.6} />}>
                            <Link to="/admin">Administration </Link>
                        </Menu.Item>

                    </>
                )}

                {keycloak && !keycloak.authenticated && (
                    <Menu.Item
                        key="login"
                        className="rightFloated"
                        icon={<Icon path={mdiAccount} size={0.6} />}
                        onClick={() => keycloak.login()}
                    >
                        Login
                    </Menu.Item>
                )}

                {keycloak && keycloak.authenticated && (
                    <Menu.Item
                        key="logout"
                        className="rightFloated"
                        icon={<Icon path={mdiAccount} size={0.6} />}
                        onClick={() => keycloak.logout()}
                    >
                        Logout ({keycloak.tokenParsed.preferred_username})
                    </Menu.Item>
                )}
            </Menu>
        </div>
    );
};

export default AppMenu;
