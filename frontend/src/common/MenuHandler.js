import SubMenu from "antd/lib/menu/SubMenu";
import { Menu } from "antd";
import T from "i18n-react";
import {
    mdiSourceBranch,
    mdiPackageVariantClosed,
    mdiAccountGroup,
    mdiAccount,
    mdiLock,
    mdiHomeGroup,
    mdiDatabaseOutline,
    mdiConnection,
    mdiVideoInputComponent,
    mdiScriptText,
    mdiScriptTextKeyOutline,
    mdiFunctionVariant,
    mdiAccountMultiple,
    mdiChartGantt,
    mdiCardSearchOutline,
    mdiFileDocumentOutline,
    mdiCardBulletedSettings,
    mdiMessage,
    mdiTagMultiple,
    mdiMonitorEye,
    mdiCertificate,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Link } from "react-router-dom";

import { match } from "path-to-regexp";

export default class MenuHandler {
    static menu = [];

    static icons = {
        mdiConnection: mdiConnection,
        mdiVideoInputComponent: mdiVideoInputComponent,
        mdiScriptText: mdiScriptText,
        mdiScriptTextKeyOutline: mdiScriptTextKeyOutline,
        mdiFunctionVariant: mdiFunctionVariant,
        mdiAccountGroup: mdiAccountGroup,
        mdiAccountMultiple: mdiAccountMultiple,
        mdiAccount: mdiAccount,
        mdiLock: mdiLock,
        mdiHomeGroup: mdiHomeGroup,
        mdiSourceBranch: mdiSourceBranch,
        mdiDatabaseOutline: mdiDatabaseOutline,
        mdiPackageVariantClosed: mdiPackageVariantClosed,
        mdiChartGantt: mdiChartGantt,
        mdiCardBulletedSettings : mdiCardBulletedSettings ,
        mdiCardSearchOutline: mdiCardSearchOutline,
        mdiFileDocumentOutline: mdiFileDocumentOutline,
        mdiMessage: mdiMessage,
        mdiTagMultiple: mdiTagMultiple,
        mdiMonitorEye: mdiMonitorEye,
        mdiCertificate: mdiCertificate,
    };

    static drawSubMenu = async (item, baseUrl) => {
        try {
            let submenu = [];

            if (item && item.children) {
                item.children.forEach((item) => {
                    let fmenu = [];
                    if (item.children && item.children.length > 0) {
                        item.children.forEach((childMenu) => {
                            fmenu.push(this.drawItem(childMenu, baseUrl));
                        });
                        if (fmenu.length > 0) {
                            submenu.push(
                                <SubMenu
                                    key={item.title}
                                    icon={<Icon size={0.6} path={this.icons[item.icon]} />}
                                    title={T.translate(item.title)}>
                                    {fmenu}
                                </SubMenu>
                            );
                        }
                    } else {
                        submenu.push(this.drawItem(item, baseUrl));
                    }
                });
                return submenu;
            }
            return [];
        } catch (error) {
            console.log(error);
        }
    };

    static drawItem = (item, baseUrl) => {
        return (
            <Menu.Item
                key={`/${item.key}`}
                icon={<Icon size={0.6} path={this.icons[item.icon]} />}
                title={T.translate(item.title)}>
                <Link to={(baseUrl || "") + item.value}>{T.translate(item.title)}</Link>
            </Menu.Item>
        );
    };

    static pathAllowed(allowedPaths, routePath, currentPath) {
        let hasAccess = false;
        for (const el of allowedPaths) {
            const routeFn = match(routePath, { decode: decodeURIComponent });
            const currentFn = match(el, { decode: decodeURIComponent });

            // console.log("Checking: " + routePath + "@" + currentPath + "->" + el);
            const routeMatch = routeFn(el);
            const currentMatch = currentFn(currentPath);

            // console.log(routeMatch);
            // console.log(currentMatch);

            hasAccess = routeMatch !== false || currentMatch !== false;
            if (hasAccess) break; //Si se encuentra en el primer nivel, se ignora el resto
        }

        return hasAccess;
    }

    static async renderMenu(dataMenu, keycloak) {
        let itemsAuthorized = [];
        if (dataMenu) {
            for (let item of dataMenu) {
                if (keycloak && keycloak.authenticated) {
                    itemsAuthorized.push(
                        this.drawItem(item)
                        // <Menu.Item
                        //     key={`/${item.key}`}
                        //     icon={<Icon path={this.icons[item.icon]} size={0.6} />}
                        //     title={T.translate(item.title)}>
                        //     <Link to={item.value}>{T.translate(item.title)}</Link>
                        // </Menu.Item>
                    );
                }
            }
        }

        return itemsAuthorized;
    }
}
