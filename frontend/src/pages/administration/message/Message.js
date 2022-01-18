import { Modal, Timeline, Spin, Divider, Button, Space } from "antd";
import Icon from "@mdi/react";
import lodash from "lodash";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import T from "i18n-react";
import { mdiTimelinePlus, mdiTimelineMinus, mdiMessagePlus } from "@mdi/js";
import MessageDataModal from "./MessageDataModal";

export default function Message({ visible, onCancel, messageData, integration, channel }) {
    const { breadcrumb_id: messageId, traces } = messageData;
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayed, setDisplayed] = useState({});
    const [showData, setShowData] = useState(null);

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

    const timelineItems = groupedMessages.map((item, msgIndex) => {
        let messageStart = "";
        let exchange = "";
        let messageEnd = "";
        let messageContent = "";
        const nodeName = item.node ? item.node : item.error ? "Error" : "Nodo eliminado";
        const timelineContent = item.data.map((message, index, array) => {
            const date = moment(message.date_time).format("DD/MM/YYYY HH:mm:ss:SSS");
            if (index === 0) {
                messageStart = date;
                exchange = message.exchange_id;
            }
            if (index === array.length - 1) {
                messageEnd = date;
            }
            if (!messageContent) {
                messageContent = message.in_msg;
            }
            //TODO: Mostrar el detalle del error (error_stack)(?)
            const errorContent =
                message.event === "ERROR" ? (
                    <>
                        <p>
                            <b>Mensaje de error:</b>
                            {` ${message.error_msg}`}
                        </p>
                        {/*  <p>
                            <b>Excepción:</b>
                            {` ${message.error_stack}`}
                        </p> */}
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
                    <p>
                        <b>Evento:</b>
                        {` ${message.event} ${message.arrow ? " | " + message.arrow : ""}`}
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
