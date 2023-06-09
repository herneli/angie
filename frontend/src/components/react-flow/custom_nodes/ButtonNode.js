import { Button, message, notification } from "antd";
import React from "react";
import axios from "axios";
import T from "i18n-react";

import { Handle } from "react-flow-renderer";
import { useCurrentChannel } from "../../../providers/channels/ChannelContext";
import { drawTags } from '../FlowUtils';

async function callApi(node, currentChannel, channelStatus) {
    const { data } = node;

    if (channelStatus.toUpperCase() === "STARTED") {
        try {
            await axios.post(`/channel/${currentChannel.id}/${data.url}`, {
                endpoint: `direct://${node.id}`,
                content: "",
            });
            message.success(T.translate("common.success"));
        } catch (error) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: error }),
            });
        }
    } else {
        message.info(T.translate("integrations.channel.inject_channel_stopped"));
    }
}

const ButtonNode = (node) => {
    const { currentChannel, currentStatus } = useCurrentChannel();
    const { data, isConnectable } = node;

    return (
        <div
            style={{
                minHeight: 18,
            }}>
            <Handle type="source" position="right" isConnectable={isConnectable} />
            {drawTags(data.tags)}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: ".2rem",
                }}>
                {data.label}
                <Button
                    onClick={(e) => {
                        if (data.url) {
                            callApi(node, currentChannel, currentStatus);
                        }
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        return;
                    }}>
                    {data.buttonLabel}
                </Button>
            </div>
        </div>
    );
};

export default ButtonNode;
