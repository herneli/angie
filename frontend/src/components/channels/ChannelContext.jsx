import React, { useState, useContext } from "react";
import { useEffect } from "react";

const ChannelContext = React.createContext();

export default function ChannelContextProvider({ currentChannel: channel, currentStatus: status, children }) {
    const [currentChannel, setCurrentChannel] = useState(channel);
    const [currentStatus, setCurrentStatus] = useState(status);

    useEffect(() => {
        setCurrentStatus(status);
    }, [status]);

    return <ChannelContext.Provider value={{ currentChannel, currentStatus }}>{children}</ChannelContext.Provider>;
}

/**
 *
 * @returns {{currentPackage: Object, dependencies: Array}}
 */
export const useCurrentChannel = () => useContext(ChannelContext);
