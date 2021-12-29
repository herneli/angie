import React, { useState, useContext } from "react";

const ChannelContext = React.createContext();

export default function ChannelContextProvider({ currentChannel, currentStatus, children }) {
    const [state, setState] = useState({
        currentChannel,
        currentStatus,
    });

    return <ChannelContext.Provider value={state}>{children}</ChannelContext.Provider>;
}

/**
 *
 * @returns {{currentPackage: Object, dependencies: Array}}
 */
export const useCurrentChannel = () => useContext(ChannelContext);
