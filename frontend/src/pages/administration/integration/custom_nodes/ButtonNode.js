import { Button, message, notification } from "antd";
import React from "react";
import axios from "axios";
import T from "i18n-react";

import { Handle } from "react-flow-renderer";

async function callApi(node) {
    const { data } = node;
    //TODO: conocer el estado del canal antes de realizar la petición
    // if (data.channel_status === "STARTED") {
    //TODO: Revisar notificaciones
    try {
        await axios.post(`/channel/${data.channel_id}/${data.url}`, {
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
    // } else {
    //     message.warn("Es necesario desplegar el canal para poder realizar esta acción.");
    // }
}

const ButtonNode = (node) => {
    const { data, isConnectable } = node;
    return (
        <div style={{ minHeight: 18 }}>
            <Handle type="source" position="right" isConnectable={isConnectable} />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "white",
                    gap: ".2rem",
                }}>
                {data.label}
                <Button
                    onClick={(e) => {
                        if (data.url) {
                            callApi(node);
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
