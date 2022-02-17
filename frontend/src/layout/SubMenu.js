import { Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import MenuHandler from "../common/MenuHandler";
import { useAngieSession } from "../providers/security/UserContext";

import lodash from "lodash";
import { useLocation } from "react-router";

const SubMenu = ({ parent, url, packageInfo }) => {
    const { Sider } = Layout;
    const { currentMenu } = useAngieSession();
    const { pathname } = useLocation();

    const [childrenKeys, setChildrenKeys] = useState([]);
    const [paintedMenu, setPaintedMenu] = useState([]);

    const [selected, changeSelection] = useState(null);

    const getSubMenu = async () => {
        const element = lodash.find(currentMenu, { value: parent });

        if (element) {
            let data = await MenuHandler.drawSubMenu(element, url);
            setChildrenKeys(lodash.map(element.children, "title"));

            setPaintedMenu(data);
        }
    };
    useEffect(() => {
        //Se utiliza la propiedad key del menu para identificar la seleccion en función de la url

        //TODO improve using path-to-regex
        let parsedName = pathname.replace(parent, "");
        if (packageInfo) {
            parsedName = parsedName.replace(packageInfo, "");
        }
        const splitted = parsedName.split("/");

        changeSelection(`/${splitted[1]}`);
    }, [pathname]);

    useEffect(() => {
        getSubMenu();
    }, [currentMenu]);

    return (
        <Sider width={200} className="adm-submenu">
            <Menu
                mode="inline"
                openKeys={childrenKeys}
                style={{ height: "100%", borderRight: 0 }}
                selectedKeys={[selected]}>
                {paintedMenu}
            </Menu>
        </Sider>
    );
};
export default SubMenu;
