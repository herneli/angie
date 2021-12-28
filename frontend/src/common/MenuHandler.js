import axios from "axios";
import SubMenu from "antd/lib/menu/SubMenu";
import { Menu } from "antd";
import T from "i18n-react";
import {
    mdiSourceBranch,
    mdiMonitor,
    mdiPackageVariantClosed,
    mdiAccountGroup,
    mdiAccount,
    mdiLock,
    mdiOfficeBuilding,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Link } from "react-router-dom";

export default class MenuHandler {
    static menu = [];

    static icons = {
        mdiAccountGroup: mdiAccountGroup,
        mdiAccount: mdiAccount,
        mdiLock: mdiLock,
        mdiOfficeBuilding: mdiOfficeBuilding,
        mdiSourceBranch: mdiSourceBranch,
        mdiMonitor: mdiMonitor,
        mdiPackageVariantClosed: mdiPackageVariantClosed,
    };

    static drawSubMenu = async (item) => {
        try {
            let submenu = [];

            if (item && item.children) {
                item.children.forEach((item) => {
                    let fmenu = [];
                    if (item.children && item.children.length > 0) {
                        item.children.forEach((childMenu) => {
                            fmenu.push(this.drawItem(childMenu));
                        });
                        if (fmenu.length > 0) {
                            submenu.push(
                                <SubMenu
                                    key={item.title}
                                    icon={<Icon size={0.6} path={this.icons[item.icon]} />}
                                    title={item.title}>
                                    {fmenu}
                                </SubMenu>
                            );
                        }
                    } else {
                        submenu.push(this.drawItem(item));
                    }
                });
                return submenu;
            }
            return [];
        } catch (error) {
            console.log(error);
        }
    };

    static drawItem = (item) => {
        return (
            <Menu.Item key={item.title} icon={<Icon size={0.6} path={this.icons[item.icon]} />} title={item.title}>
                <Link to={item.value}>{T.translate(item.title)}</Link>
            </Menu.Item>
        );
    };

    static async hasRealmRoleForPath(id, path) {
        const data = await axios.post(`/section/${id}/path_allowed`, { path: path });
        if (data.status === 200) {
            return data.data.data;
        } else {
            return [];
        }
    }

    static async getMenu(id, keycloak) {
        let itemsAuthorized = [];
        let dataMenu = await this.checkAllowedSections(id);
        if (dataMenu) {
            for (let item of dataMenu) {
                if (keycloak && keycloak.authenticated) {
                    itemsAuthorized.push(
                        <Menu.Item
                            key={`/${item.key}`}
                            icon={<Icon path={this.icons[item.icon]} size={0.6} />}
                            title={item.title}>
                            <Link to={item.value}>{T.translate(item.title)}</Link>
                        </Menu.Item>
                    );
                }
            }
        }

        return itemsAuthorized;
    }

    static async checkAllowedSections(id) {
        try {
            const data = await axios.post(`/section/${id}/check_allowed`);

            if (data.status === 200) {
                return data.data.data;
            } else {
                return [];
            }
        } catch (e) {
            return false;
        }
    }
}
