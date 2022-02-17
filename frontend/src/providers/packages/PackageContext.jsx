import React, { useState, useContext } from "react";

const PackageContext = React.createContext();

export default function PackageContextProvider({ currentPackage, dependencies, children }) {
    const [state, setState] = useState({
        currentPackage: currentPackage,
        dependencies: dependencies,
    });

    return <PackageContext.Provider value={state}>{children}</PackageContext.Provider>;
}

/**
 *
 * @returns {{currentPackage: Object, dependencies: Array}}
 */
export const usePackage = () => useContext(PackageContext);
