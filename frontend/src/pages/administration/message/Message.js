import { Modal, Timeline, Spin, Divider, Button, Space, notification } from "antd";
import Icon from "@mdi/react";
import lodash from "lodash";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import T from "i18n-react";
import {
    mdiTimelinePlus,
    mdiTimelineMinus,
    mdiMessagePlus,
    mdiEmailReceiveOutline,
    mdiEmailSendOutline,
    mdiEmailRemoveOutline,
} from "@mdi/js";
import MessageDataModal from "./MessageDataModal";

export default function MessageGroup({ visible, onCancel, messageData, integration, channel }) {
    const { breadcrumb_id: messageId } = messageData;
    const [nodes, setNodes] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayed, setDisplayed] = useState({});
    const [showData, setShowData] = useState(null);

    const timelineTypes = {
        send: <Icon path={mdiEmailSendOutline} size="20px" color="#52C41A" title={T.translate("messages.sent")}></Icon>,
        receive: (
            <Icon
                path={mdiEmailReceiveOutline}
                size="20px"
                color="#1976D2"
                title={T.translate("messages.received")}></Icon>
        ),
        error: (
            <Icon path={mdiEmailRemoveOutline} size="20px" color="#FF4D4F" title={T.translate("common.error")}></Icon>
        ),
    };

    const setData = async () => {
        const channelNodes = await getChannelNodes(integration, channel);
        const traces = await getMessageTraces(channel, messageId);
        setNodes(channelNodes);
        setMessages(traces);
        setLoading(false);
    };

    useEffect(() => {
        setData();
    }, []);

    const resendMessage = async (messageContent, endpoint) => {
        let message = {
            content: {
                content: messageContent,
                endpoint: endpoint,
            },
            integration: integration,
            channel: channel,
            routeId: endpoint,
        };

        const response = await axios.post("/jum_agent/resend", message);
    };

    const groupedMessages = groupNodes(messages, nodes);

    const timelineItems = groupedMessages.map((item, msgIndex) => {
        let messageStart = "";
        let exchange = "";
        let messageEnd = "";
        let errorException = "";
        let messageContent = "";
        let type = "";
        const nodeName = item.node
            ? item.node
            : item.error
            ? T.translate("common.error")
            : T.translate("messages.node_unknown");

        const timelineContent = item.data.map((trace, index, array) => {
            const message = trace.data;

            const date = moment.unix(message.date_time).format("DD/MM/YYYY HH:mm:ss:SSS");

            if (index === 0) {
                messageStart = date;
                exchange = message.exchange_id;
            }
            type =
                message.arrow === "****"
                    ? "error"
                    : message.arrow === "*<--" || message.arrow === "<---"
                    ? "receive"
                    : "send";
            if (index === array.length - 1) {
                messageEnd = date;
            }

            if (!messageContent) {
                messageContent = message.in_msg;
            }

            if (!errorException) {
                errorException = message.error_stack;
            }

            const errorContent =
                message.event === "ERROR" ? (
                    <>
                        {message.error_msg && (
                            <p>
                                <b>{`${T.translate("messages.error_message")}:`}</b>
                                {` ${message.error_msg}`}
                            </p>
                        )}
                        <p>
                            <a
                                href="#null"
                                style={{ color: "red" }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowData({
                                        title: `${T.translate("messages.exception")} (${nodeName})`,
                                        node: nodeName,
                                        content: errorException,
                                        type: "error",
                                    });
                                }}>
                                {`${T.translate("messages.show_exception")}`}
                            </a>
                        </p>
                    </>
                ) : null;

            const successContent =
                message.event !== "ERROR" ? (
                    <>
                        <p>
                            <b>Endpoint: </b>
                            {" " + message.node_endpoint}
                        </p>
                    </>
                ) : null;

            const headersContent = message.headers && (
                <p>
                    <a
                        href="#null"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowData({
                                title: `${T.translate("messages.headers")} (${nodeName})`,
                                node: nodeName,
                                content: JSON.stringify(message.headers),
                            });
                        }}>
                        {`${T.translate("messages.show_headers")}`}
                    </a>
                </p>
            );

            return (
                <>
                    {timelineTypes[type]}
                    <p>
                        <b>{`${T.translate("messages.event")}:`}</b>
                        {` ${message.event}`}
                    </p>

                    <p>
                        <b>{`${T.translate("messages.date_time")}:`}</b>
                        {" " + date}
                    </p>
                    <p>
                        <b>{`${T.translate("messages.elapsed")}:`}</b>
                        {" " + message.elapsed}
                    </p>
                    <p>
                        <b>Exchange Id: </b>
                        {" " + message.exchange_id}
                    </p>
                    {successContent}
                    {errorContent}
                    {headersContent}
                    <Divider></Divider>
                </>
            );
        });

        const timelineLabel = (
            <>
                <p>
                    <b>{nodeName}</b>
                </p>
                {/*  <p>
                    <b>Exchange Id:</b> {exchange}
                </p> */}
                <p>
                    <b>{`${T.translate("messages.start")}:`}</b> {messageStart}
                </p>
                <p>
                    <b>{`${T.translate("messages.end")}:`}</b> {messageEnd}
                </p>
                <Divider></Divider>
            </>
        );

        return (
            <Timeline.Item key={`message${msgIndex}`} label={timelineLabel} color={item.error ? "red" : "green"}>
                {displayed["message" + msgIndex] ? (
                    <>
                        <p>
                            <Button
                                icon={<Icon size="20px" path={mdiTimelineMinus} />}
                                title={T.translate("messages.hide_traces")}
                                onClick={() => {
                                    setDisplayed({ ...displayed, ["message" + msgIndex]: false });
                                }}></Button>
                        </p>
                        {timelineContent}
                    </>
                ) : (
                    <Space style={{ marginBottom: "5rem" }} size="middle">
                        <Button
                            icon={<Icon size="20px" path={mdiTimelinePlus} />}
                            title={T.translate("messages.show_traces")}
                            onClick={() => {
                                setDisplayed({ ...displayed, ["message" + msgIndex]: true });
                            }}
                        />

                        <Button
                            icon={<Icon size="20px" path={mdiMessagePlus} />}
                            disabled={!messageContent}
                            title={
                                messageContent
                                    ? T.translate("messages.show_body")
                                    : T.translate("messages.body_undefined")
                            }
                            onClick={() => {
                                setShowData({
                                    title: `${T.translate("messages.body")} (${nodeName})`,
                                    node: nodeName,
                                    content: messageContent,
                                    nodes: nodes,
                                });
                            }}
                        />
                    </Space>
                )}
            </Timeline.Item>
        );
    });

    return (
        <>
            <Modal
                title={`${T.translate("messages.traces_from_message")} ${messageId}`}
                visible={visible}
                onCancel={onCancel}
                cancelButtonProps={{ style: { display: "none" } }}
                onOk={onCancel}
                destroyOnClose={true}
                width={1000}>
                {loading ? (
                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <Spin tip={T.translate("application.loading")} />
                    </div>
                ) : messages?.length > 0 ? (
                    <Timeline mode="left">{timelineItems}</Timeline>
                ) : (
                    <p>{T.translate("messages.empty_traces")}</p>
                )}
            </Modal>
            {showData && (
                <MessageDataModal
                    visible={Boolean(showData)}
                    messageData={showData}
                    route={showData}
                    nodes={nodes}
                    groupedMessages={groupedMessages}
                    resendMessage={(messageContent, endpoint) => {
                        resendMessage(messageContent, endpoint);
                    }}
                    onCancel={() => {
                        setShowData(null);
                    }}
                />
            )}
        </>
    );
}

/**
 * Agrupa los mensajes por el nodo correspondiente
 * @param {Array} messages Trazas de un mensaje
 * @param {Array} nodes Nodos del canal
 * @returns
 */
const groupNodes = (messages, nodes) => {
    const groupedByNodeId = lodash.groupBy(messages, "current_route");
    const result = Object.keys(groupedByNodeId).map((nodeId) => {
        const nodeLabel = lodash.find(nodes, { id: nodeId })?.label || T.translate("messages.node_unknown");
        const hasError = Boolean(lodash.find(groupedByNodeId[nodeId], { event: "ERROR" }));

        return { node: nodeLabel, error: hasError, data: groupedByNodeId[nodeId] };
    });

    return result;
};

/**
 * Obtiene los nodos de un canal
 * @param {String} integration Id de la integración
 * @param {String} channel Id del canal
 * @returns
 */
const getChannelNodes = async (integration, channel) => {
    try {
        const response = await axios.get(`/integration/${integration}/channel/${channel}`);

        if (response.data?.data?.nodes) {
            return response.data.data.nodes.map((node) => {
                return { id: node.id, label: node.data.label };
            });
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
        notification.error({
            message: T.translate("common.messages.error.title"),
            description: T.translate("common.messages.error.description", { error: error }),
        });
    }
};

/**
 * Obtiene las trazas de un mensaje
 * @param {*} channel Id del canal
 * @param {*} messageId Id del mensaje (breadcrumb_id)
 * @returns
 */
export const getMessageTraces = async (channel, messageId) => {
    try {
        const response = await axios.get(`/messages/${channel}/traces/${messageId}`);
        return response.data || [];
    } catch (error) {
        console.error(error);
        notification.error({
            message: T.translate("common.messages.error.title"),
            description: T.translate("common.messages.error.description", { error: error }),
        });
    }
};
