import { useKeycloak } from "@react-keycloak/web";
import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Popover } from "antd";
import { mdiAccountGroup, mdiConnection, mdiPalette } from "@mdi/js";
import { Link } from "react-router-dom";
import MenuHandler from "../common/MenuHandler";

import T from "i18n-react";

import { mdiAccount, mdiHome, mdiLogout, mdiSourceBranch } from "@mdi/js";
import Icon from "@mdi/react";

const AppMenu = ({ tokenLoaded }) => {
    const { keycloak } = useKeycloak();
    const { Sider } = Layout;
    const { SubMenu } = Menu;
    const [selected, changeSelection] = useState(null);
    const [paintedMenu, setPaintedMenu] = useState([]);
    const [tokenState, setTokenState] = useState();

    useEffect(() => {
        (async () => {
            console.log(tokenLoaded);
            if (keycloak.tokenParsed && keycloak.tokenParsed.sub) {
                const menu = await getMenuItems();
                setPaintedMenu(menu);
            }
        })();
    }, [tokenState]);

    useEffect(() => {
        setTokenState(tokenLoaded);
    }, [tokenLoaded]);

    const icons = {
        mdiAccountGroup: mdiAccountGroup,
        mdiConnection: mdiConnection,
        mdiPalette: mdiPalette,
        mdiSourceBranch: mdiSourceBranch
    };
    //TODO get current center (#4)
    const userPopup = keycloak && keycloak.authenticated && (
        <span>
            {T.translate("application.user_info.user_label")} {keycloak.tokenParsed.preferred_username}<br />
            {T.translate("application.user_info.organization_label")} XXX <Button type='link'>{T.translate("application.user_info.organization_change_label")}</Button><br />
            <br />
            <div>
                <Button type="primary" size='small' block icon={<Icon path={mdiLogout} size={0.5} onClick={() => keycloak.logout()} title={T.translate('application.user_info.logout_title')} />} >
                    {T.translate('application.user_info.logout')}
                </Button>
            </div>
        </span>
    );

    const getMenuItems = async () => {
        let menu = [];
        let itemsAuthorized = [];
        let dataMenu = await MenuHandler.checkAllowedSections(keycloak.tokenParsed.sub);

        if (dataMenu != null && dataMenu.length > 0 ) {
            for (let item of dataMenu) {
                if (keycloak && keycloak.authenticated) {
                    itemsAuthorized.push(
                        <Menu.Item key={item.title} icon={<Icon path={icons[item.icon]} size={0.6} />} title={item.title}>
                            <Link to={item.value}>{T.translate(item.title)}</Link>
                        </Menu.Item>
                    );
                }
            }
        }

        //Quitar esto cuando esten las secciones bien configuradas.
        if (itemsAuthorized.length <= 0) {
            itemsAuthorized.push(
                <Menu.Item key="admin" icon={<Icon path={mdiSourceBranch} size={0.6} />}>
                    <Link to="/admin">Administration </Link>
                </Menu.Item>
            );
        }

        return itemsAuthorized;
    };

    //TODO translate main links
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

                <>{keycloak && keycloak.authenticated && paintedMenu}</>

                {keycloak && !keycloak.authenticated && (
                    <Menu.Item
                        key="login"
                        className="rightFloated"
                        icon={<Icon path={mdiAccount} size={0.6} />}
                        onClick={() => keycloak.login()}
                    >
                        {T.translate('application.user_info.login')}
                    </Menu.Item>
                )}

                {keycloak && keycloak.authenticated && (
                    <>
                        <Popover content={userPopup} title={T.translate('application.user_info.title')} trigger="click">
                            <Menu.Item
                                key="logout"
                                className="userInfoButton rightFloated"
                                icon={<Icon path={mdiAccount} size={0.5} />}

                            >
                                {keycloak.tokenParsed.preferred_username}
                            </Menu.Item>
                        </Popover>
                        <Button className="logoutBtn" type="primary" size='middle' shape='circle' icon={<Icon path={mdiLogout} size={0.6} onClick={() => keycloak.logout()} title={T.translate('application.user_info.logout_title')} />} />
                    </>
                )}
            </Menu>
        </div>
    );
};

export default AppMenu;
