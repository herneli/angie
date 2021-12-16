import React, { useState, useContext } from "react";

const ScriptContext = React.createContext();

export default function ScriptContextProvider({ manager, children }) {
    const [stateManager, setStateManager] = useState(manager);
    return (
        <ScriptContext.Provider
            value={{
                manager: stateManager,
                setManager: setStateManager,
            }}>
            {children}
        </ScriptContext.Provider>
    );
}

/**
 *
 * @returns {{manager: ScriptManager, setManager: Function}}
 */
export const useScriptContext = () => useContext(ScriptContext);
