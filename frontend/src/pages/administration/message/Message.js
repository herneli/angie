import { Modal, Timeline, Spin, Divider, Button, Space } from "antd";
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
        send: <Icon path={mdiEmailSendOutline} size="20px" color="#52C41A"></Icon>,
        receive: <Icon path={mdiEmailReceiveOutline} size="20px" color="#1976D2"></Icon>,
        error: <Icon path={mdiEmailRemoveOutline} size="20px" color="#FF4D4F"></Icon>,
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

    const groupedMessages = groupNodes(messages, nodes);

    const timelineItems = groupedMessages.map((item, msgIndex) => {
        let messageStart = "";
        let exchange = "";
        let messageEnd = "";
        let errorException = "";
        let messageContent = "";
        let type = "";
        const nodeName = item.node ? item.node : item.error ? "Error" : "Nodo eliminado";
        const timelineContent = item.data.map((message, index, array) => {
            const date = moment(message.date_time).format("DD/MM/YYYY HH:mm:ss:SSS");
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
            //TODO: Mostrar el detalle del error (error_stack)(?)
            const errorContent =
                message.event === "ERROR" ? (
                    <>
                        <p>
                            <b>Mensaje de error:</b>
                            {` ${message.error_msg}`}
                        </p>
                        <p>
                            <a
                                href="#null"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowData({ node: nodeName, content: errorException, type: "error" });
                                }}>
                                Mostrar excepción
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

            return (
                <>
                    {timelineTypes[type]}
                    <p>
                        <b>Evento:</b>
                        {` ${message.event}`}
                    </p>

                    <p>
                        <b>Fecha: </b>
                        {" " + date}
                    </p>
                    <p>
                        <b>Elapsed: </b>
                        {" " + message.elapsed}
                    </p>
                    <p>
                        <b>Exchange Id: </b>
                        {" " + message.exchange_id}
                    </p>
                    {successContent}
                    {errorContent}
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
                    <b>Excahge Id:</b> {exchange}
                </p> */}
                <p>
                    <b>Inicio:</b> {messageStart}
                </p>
                <p>
                    <b>Fin:</b> {messageEnd}
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
                            title="Ver trazas"
                            onClick={() => {
                                setDisplayed({ ...displayed, ["message" + msgIndex]: true });
                            }}
                        />

                        <Button
                            icon={<Icon size="20px" path={mdiMessagePlus} />}
                            disabled={!messageContent}
                            title={messageContent ? "Body del mensaje" : "No hay body para mostrar"}
                            onClick={() => {
                                setShowData({ node: nodeName, content: messageContent });
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
                title={`Mensaje ${messageId}`}
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
                ) : (
                    <Timeline mode="left">{timelineItems}</Timeline>
                )}
            </Modal>
            {showData && (
                <MessageDataModal
                    visible={Boolean(showData)}
                    messageData={showData}
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
        const nodeLabel = lodash.find(nodes, { id: nodeId })?.label || "Nodo eliminado";
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
        if (response.data?.hits?.hits) {
            return response.data.hits.hits.map((trace) => trace._source);
        }
        return [];
    } catch (error) {
        console.error(error);
    }
};
