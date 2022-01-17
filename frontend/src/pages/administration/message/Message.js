import { Modal, Timeline, Spin, Divider } from "antd";
import lodash from "lodash";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import T from "i18n-react";

export default function Message({ visible, onCancel, messageData, integration, channel }) {
    const { breadcrumb_id: messageId, traces } = messageData;
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getChannelData();
    }, []);

    const getChannelData = async () => {
        try {
            const response = await axios.get(`/integration/${integration}/channel/${channel}`);
            if (response?.data?.data?.nodes) {
                setNodes(response.data.data.nodes);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const messages = traces.map((item) => item._source);
    const groupedMessages = groupNodes(messages, nodes);

    const timelineItems = groupedMessages.map((item, index) => {
        const timelineContent = item.data.map((message) => {
            const date = moment(message.date_time).format("DD/MM/YYYY HH:mm:ss");
            return (
                <>
                    <p>{`${message.arrow ? message.arrow + " | " : ""}${message.event} | ${date}`}</p>
                    <p>{`${message.exchange_id}`}</p>
                    <p>{`${message.node_endpoint || ""} `}</p>
                    <p>{`${message.current_route || ""} `}</p>
                    <Divider></Divider>
                </>
            );
        });

        return (
            <Timeline.Item
                key={`message${index}`}
                label={item.node || "Nodo desconocido"}
                color={item.error ? "red" : "green"}>
                {timelineContent}
            </Timeline.Item>
        );
    });

    return (
        <Modal
            title={`Mensaje ${messageId}`}
            visible={visible}
            onCancel={onCancel}
            onOk={onCancel}
            destroyOnClose={true}
            width={1000}>
            {loading ? (
                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <Spin tip={T.translate("application.loading")} />
                </div>
            ) : (
                <Timeline mode="alternate">{timelineItems}</Timeline>
            )}
        </Modal>
    );
}

/**
 * Agrupa los mensajes por el nodo correspondiente en orden de aparición
 * @param {*} messages
 * @param {*} nodes
 * @returns
 */
const groupNodes = (messages, nodes) => {
    const result = [];
    let acc = { node: "", data: [] };
    const restartAcc = () => {
        acc.node = "";
        acc.data = [];
        acc.error = false;
    };

    for (let i = 0; i <= messages.length; i++) {
        if (i !== messages.length) {
            const currentMessage = messages[i];
            const prevMessage = messages[i - 1];
            if (prevMessage && currentMessage.current_route !== prevMessage?.current_route) {
                result.push({ ...acc });
                restartAcc();
            }
            if (!acc.node) {
                const node = lodash.find(nodes, { id: currentMessage.current_route });
                acc.node = node?.data.label || currentMessage.current_route;
            }
            if (currentMessage.event === "ERROR") {
                acc.error = true;
            }
            acc.data.push(currentMessage);
        } else {
            result.push({ ...acc });
        }
    }

    return result;
};
