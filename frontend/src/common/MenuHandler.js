import axios from "axios";
import SubMenu from "antd/lib/menu/SubMenu";
import { Menu } from "antd";
import T from "i18n-react";
import { mdiAccount, mdiHome, mdiLogout, mdiSourceBranch } from "@mdi/js";
import Icon from "@mdi/react";
import { Link } from "react-router-dom";

export default class MenuHandler {
    static menu = [];

    static icons = {
        mdiSourceBranch: mdiSourceBranch,
    };

    static drawSubMenu = async (item, menuLoaded, id) => {
        try {
             let submenu = [];
             let menu = [];
             menu = await this.checkAllowedSections(id);

             if (menu && menu.length > 0) {
                 let menuObject = menu.filter((element) => element.value == item);
                 menuObject.forEach((menuEntry) => {
                     if (menuEntry.children) {
                         menuEntry.children.forEach((item) => {
                             let fmenu = [];
                             if (item.children && item.children.length > 0) {
                                 item.children.forEach((childMenu) => {
                                     fmenu.push(this.drawItem(childMenu));
                                 });
                                 if (fmenu.length > 0) {
                                     submenu.push(
                                         <SubMenu key={item.title} icon={<Icon size={1} />} title={item.title}>
                                             {fmenu}
                                         </SubMenu>
                                     );
                                 }
                             } else {
                                 submenu.push(this.drawItem(item));
                             }
                         });
                     }
                 });
                 return submenu;
             }
        return [];
        } catch (error) {
            console.log(error)
        }
       
    };

    static drawItem = (item) => {
        return (
            <Menu.Item key={item.title} icon={<Icon size={1} />} title={item.title}>
                <Link to={item.value}>{T.translate(item.title)}</Link>
            </Menu.Item>
        );
    };

    static async hasRealmRoleForPath(id, path) {
        const data = await axios.post("/isPathAvailable", { id: id, path: path });
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
                            key={item.title}
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
            const data = await axios.post("/getAllowedSectionBasedOnRole", { id: id });
     
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
