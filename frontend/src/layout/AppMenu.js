import { useKeycloak } from "@react-keycloak/web";
import React, { useState, useEffect } from "react";
import { Menu, Button, Popover, Select } from "antd";
import { useLocation, Link } from "react-router-dom";
import MenuHandler from "../common/MenuHandler";

import T from "i18n-react";

import { mdiAccount, mdiHomeGroup, mdiHome, mdiLogout } from "@mdi/js";
import Icon from "@mdi/react";
import { useAngieSession } from "../providers/security/UserContext";
import lodash from "lodash";

import * as api from "../api/configurationApi";
import AuthorizedElement from "../components/security/AuthorizedElement";
import AuthorizedFunction from "../components/security/AuthorizedFunction";

const AppMenu = ({ app }) => {
    const { keycloak } = useKeycloak();
    const { pathname } = useLocation();
    const { currentUser, currentMenu } = useAngieSession();
    const [selected, changeSelection] = useState(null);
    const [paintedMenu, setPaintedMenu] = useState([]);
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
        loadOrganizations();
    }, []);

    /**
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadOrganizations = async () => {
        try {
            const organizations = await api.getModelDataList("organization");
            setOrganizations(organizations);
        } catch (ex) {
            console.error(ex);
        }
    };

    useEffect(() => {
        //Se utiliza la propiedad key del menu para identificar la seleccion en función de la url

        //TODO improve using path-to-regex
        const splitted = pathname.split("/");

        changeSelection(`/${splitted[1]}`);
    }, [pathname]);

    useEffect(() => {
        getMenuItems();
    }, [currentMenu]);

    const getMenuItems = async () => {
        let renderedMenu = await MenuHandler.renderMenu(currentMenu, keycloak);
        setPaintedMenu(renderedMenu);
    };

    const getOrganizationName = (id) => {
        if (id === "all") {
            return { name: T.translate("application.user_info.organizations.all") };
        }
        if (id === "assigned") {
            return { name: T.translate("application.user_info.organizations.assigned") };
        }
        return lodash.find(organizations, { id: id }) || { name: "-" };
    };

    const filterOrganizations = () => {
        if (!currentUser.organization_id) return [];
        return lodash.filter(organizations, (org) => currentUser.organization_id.indexOf(org.id) !== -1);
    };

    const organizationSelect = () => (
        <Select
            showSearch
            value={currentUser.current_organization}
            style={{ width: "100%", minWidth: 160 }}
            onChange={handleOrgChange}
            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
            {AuthorizedFunction(["admin"]) && ( //Solo los usuarios admin pueden ver la opción todos
                <Select.Option key={"all"} value={"all"}>
                    {T.translate("application.user_info.organizations.all")}
                </Select.Option>
            )}
            <Select.Option key={"assigned"} value={"assigned"}>
                {T.translate("application.user_info.organizations.assigned")}
            </Select.Option>
            {filterOrganizations().map((org) => (
                <Select.Option key={org.id} value={org.id}>
                    {org?.name}
                </Select.Option>
            ))}
        </Select>
    );

    const userPopup = () =>
        keycloak &&
        keycloak.authenticated &&
        currentUser && (
            <span>
                {T.translate("application.user_info.user_label")} {currentUser?.username}
                <br />
                {T.translate("application.user_info.user_email")} {currentUser?.email}
                <br />
                {T.translate("application.user_info.organization_label")} {currentUser?.organization_data}
                <br />
            </span>
        );

    const handleOrgChange = async (value) => {
        currentUser.current_organization = value;
        await api.saveModelData("users", currentUser, null, false);

        await app.loadUserInfo(currentUser.id);
    };

    //TODO translate main links
    return (
        <div>
            <div className="logo">
                <img alt="logo" src={process.env.PUBLIC_URL + "/logo512.png"} />
            </div>
            <Menu selectedKeys={[selected]} mode="horizontal">
                <Menu.Item key="/" icon={<Icon path={mdiHome} size={0.6} />}>
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
                    <span key={"MenuStandars"}>
                        {currentUser && (
                            <Popover
                                key="orgPop"
                                title={T.translate("application.user_info.change_org")}
                                content={organizationSelect()}
                                trigger="click">
                                <Menu.Item
                                    key="org"
                                    className="orgInfoButton rightFloated"
                                    icon={<Icon path={mdiHomeGroup} size={0.6} />}>
                                    {getOrganizationName(currentUser?.current_organization).name}
                                </Menu.Item>
                            </Popover>
                        )}
                        <Popover
                            key="logoutPop"
                            content={userPopup()}
                            title={T.translate("application.user_info.title")}
                            trigger="click">
                            <Menu.Item
                                key="logout"
                                className="userInfoButton rightFloated"
                                icon={<Icon path={mdiAccount} size={0.6} />}>
                                {keycloak.tokenParsed.preferred_username}
                            </Menu.Item>
                        </Popover>
                        <Menu.Item key="logoutButton"  style={{marginTop : "-0.4%"}} className="logoutBtn">
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
                    </span>
                )}
            </Menu>
        </div>
    );
};

export default AppMenu;
