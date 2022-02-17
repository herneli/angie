import React, { useState, useContext } from "react";
import { useEffect } from "react";

const UserContext = React.createContext();

export default function UserContextProvider({ user, menu, allowedPaths, children }) {
    const [currentMenu, setCurrentMenu] = useState(menu);
    const [currentAllowedPaths, setCurrentAllowedPaths] = useState(allowedPaths);
    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
        setCurrentUser(user);
        setCurrentMenu(menu);
        setCurrentAllowedPaths(allowedPaths);
    }, [user, menu, allowedPaths]);

    return (
        <UserContext.Provider value={{ currentUser, currentMenu, currentAllowedPaths }}>
            {children}
        </UserContext.Provider>
    );
}

/**
 *
 * @returns {{currentPackage: Object, dependencies: Array}}
 */
export const useAngieSession = () => useContext(UserContext);
