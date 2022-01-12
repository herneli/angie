import React, { useState, useContext } from "react";
import { useEffect } from "react";

const MenuContext = React.createContext();

export default function MenuContextProvider({ menu, allowedPaths, children }) {
    const [currentMenu, setCurrentMenu] = useState(menu);
    const [currentAllowedPaths, setCurrentAllowedPaths] = useState(allowedPaths);

    useEffect(() => {
        setCurrentMenu(menu);
        setCurrentAllowedPaths(allowedPaths);
    }, [menu, allowedPaths]);

    return <MenuContext.Provider value={{ currentMenu, currentAllowedPaths }}>{children}</MenuContext.Provider>;
}

/**
 *
 * @returns {{currentPackage: Object, dependencies: Array}}
 */
export const useMenu = () => useContext(MenuContext);
