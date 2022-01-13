import { Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import MenuHandler from "../common/MenuHandler";
import { useAngieSession } from "../components/security/UserContext";

import lodash from "lodash";

const SubMenu = ({ parent,  url}) => {
    const { Sider } = Layout;
    const { currentMenu } = useAngieSession();

    const [childrenKeys, setChildrenKeys] = useState([]);
    const [paintedMenu, setPaintedMenu] = useState([]);

    const getSubMenu = async () => {
        const element = lodash.find(currentMenu, { value: parent });

        if (element) {
            let data = await MenuHandler.drawSubMenu(element,url);
            setChildrenKeys(lodash.map(element.children, "title"));

            setPaintedMenu(data);
        }
    };

    useEffect(() => {
        getSubMenu();
    }, [currentMenu]);

    return (
        <Sider width={200} className="adm-submenu">
            <Menu mode="inline" openKeys={childrenKeys} style={{ height: "100%", borderRight: 0 }}>
                {paintedMenu}
            </Menu>
        </Sider>
    );
};
export default SubMenu;
