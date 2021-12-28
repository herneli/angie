import { useKeycloak } from "@react-keycloak/web";
import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Popover } from "antd";
import { Link } from "react-router-dom";
import MenuHandler from "../common/MenuHandler";

import T from "i18n-react";

import { mdiAccount, mdiHome, mdiLogout } from "@mdi/js";
import Icon from "@mdi/react";

const AppMenu = ({ tokenLoaded }) => {
    const { keycloak } = useKeycloak();
    const [selected, changeSelection] = useState(null);
    const [paintedMenu, setPaintedMenu] = useState([]);

    useEffect(() => {
        (async () => {
            if (keycloak.tokenParsed && keycloak.tokenParsed.sub) {
                const menu = await getMenuItems();
                setPaintedMenu(menu);
            }
        })();
    }, [tokenLoaded]);

    //TODO get current center (#4)
    const userPopup = keycloak && keycloak.authenticated && (
        <span>
            {T.translate("application.user_info.user_label")} {keycloak.tokenParsed.preferred_username}
            <br />
            {T.translate("application.user_info.organization_label")} XXX{" "}
            <Button type="link">{T.translate("application.user_info.organization_change_label")}</Button>
            <br />
            <br />
            <div>
                <Button
                    type="primary"
                    size="small"
                    block
                    icon={
                        <Icon
                            path={mdiLogout}
                            size={0.5}
                            onClick={() => keycloak.logout()}
                            title={T.translate("application.user_info.logout_title")}
                        />
                    }>
                    {T.translate("application.user_info.logout")}
                </Button>
            </div>
        </span>
    );

    const getMenuItems = async () => {
        let menu = [];
        let itemsAuthorized = [];
        let dataMenu = await MenuHandler.getMenu(keycloak.tokenParsed.sub, keycloak);

        if (dataMenu != null && dataMenu.length > 0) {
            itemsAuthorized = dataMenu;
        }

        return itemsAuthorized;
    };

    //TODO translate main links
    return (
        <div>
            <div className="logo">
                <img alt="logo" src={process.env.PUBLIC_URL + "/logo512.png"} />
            </div>
            <Menu onClick={(e) => changeSelection(e.key)} selectedKeys={[selected]} mode="horizontal">
                <Menu.Item key="home" icon={<Icon path={mdiHome} size={0.6} />}>
                    <Link to="/">Home Page </Link>
                </Menu.Item>

                <>{keycloak && keycloak.authenticated && paintedMenu}</>

                {keycloak && !keycloak.authenticated && (
                    <Menu.Item
                        key="login"
                        className="rightFloated"
                        icon={<Icon path={mdiAccount} size={0.6} />}
                        onClick={() => keycloak.login()}>
                        {T.translate("application.user_info.login")}
                    </Menu.Item>
                )}

                {keycloak && keycloak.authenticated && (
                    <>
                        <Popover content={userPopup} title={T.translate("application.user_info.title")} trigger="click">
                            <Menu.Item
                                key="logout"
                                className="userInfoButton rightFloated"
                                icon={<Icon path={mdiAccount} size={0.5} />}>
                                {keycloak.tokenParsed.preferred_username}
                            </Menu.Item>
                        </Popover>
                        <Menu.Item key="logoutButton" className="logoutBtn">
                            <Button
                                type="primary"
                                size="middle"
                                shape="circle"
                                icon={
                                    <Icon
                                        path={mdiLogout}
                                        size={0.6}
                                        onClick={() => keycloak.logout()}
                                        title={T.translate("application.user_info.logout_title")}
                                    />
                                }
                            />
                        </Menu.Item>
                    </>
                )}
            </Menu>
        </div>
    );
};

export default AppMenu;
