import axios from "axios";
import AceEditor from "react-ace";

import { Modal, notification, Tabs } from "antd";

class ChannelActions {
    /**
     * Muestra la ventana de debug
     */
    showChannelLog = async (integrationId, channelId, activeAgent) => {
        if (channelId) {
            const response = await axios.get(`/integration/${integrationId}/channel/${channelId}/log`);

            const agentLogs = response?.data?.data;

            Modal.info({
                title: "Log Channel",
                width: "60vw",
                closable: true,
                centered: true,
                content: (
                    <Tabs defaultActiveKey={activeAgent}>
                        {agentLogs.map((agent) => (
                            <Tabs.TabPane tab={agent.agentName} key={agent.agentId}>
                                <AceEditor
                                    setOptions={{
                                        useWorker: false,
                                    }}
                                    width="100%"
                                    value={agent.data + ""}
                                    name="chann.log"
                                    theme="github"
                                />
                            </Tabs.TabPane>
                        ))}
                    </Tabs>
                ),
                onOk() {},
            });
        }
    };

    deployToAnotherAgent = async (integrationId, channelId) => {
        try {
            const response = await axios.post(`/integration/${integrationId}/channel/${channelId}/move/`);

            let newChann = response?.data?.data;
            return newChann;
        } catch (ex) {
            console.log(ex);
            if (ex?.response?.data?.message?.indexOf("no_agent_available") !== -1) {
                return notification.error({
                    message: "No hay Agentes",
                    description: "No hay ningún agente disponible para mover este canal.",
                });
            }
            return notification.error({
                message: "Se ha producido un error",
                description: "No se ha podido desplegar el canal, revise el log para mas información.",
            });
        }
    };
    deployToSpecificAgent = async (integrationId, channelId, toAgentId) => {
        try {
            const response = await axios.post(`/integration/${integrationId}/channel/${channelId}/move/${toAgentId}`);

            let newChann = response?.data?.data;
            return newChann;
        } catch (ex) {
            console.log(ex);
            if (ex?.response?.data?.message?.indexOf("no_agent_available") !== -1) {
                return notification.error({
                    message: "No hay Agentes",
                    description: "No hay ningún agente disponible para mover este canal.",
                });
            }
            return notification.error({
                message: "Se ha producido un error",
                description: "No se ha podido desplegar el canal, revise el log para mas información.",
            });
        }
    };

    deployChannel = async (integrationId, channelId) => {
        try {
            const response = await axios.post(`/integration/${integrationId}/channel/${channelId}/deploy`);

            let newChann = response?.data?.data;
            return newChann;
        } catch (ex) {
            console.log(ex);
            if (ex?.response?.data?.message?.indexOf("no_agent_available") !== -1) {
                return notification.error({
                    message: "No hay Agentes",
                    description: "No hay ningún agente disponible para desplegar este canal.",
                });
            }
            return notification.error({
                message: "Se ha producido un error",
                description: "No se ha podido desplegar el canal, revise el log para mas información.",
            });
        }
    };

    undeployChannel = async (integrationId, channelId) => {
        try {
            const response = await axios.post(`/integration/${integrationId}/channel/${channelId}/undeploy`);

            let newChann = response?.data?.data;
            return newChann;
        } catch (ex) {
            console.log(ex);
            return notification.error({
                message: "Se ha producido un error",
                description: "No se ha podido replegar el canal, revise el log para mas información.",
            });
        }
    };
}

export default ChannelActions;
