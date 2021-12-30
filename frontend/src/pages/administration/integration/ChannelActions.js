
import axios from "axios";
import AceEditor from "react-ace";

import { Modal, notification } from "antd";

class ChannelActions {

    /**
     * Muestra la ventana de debug
     */
     showChannelLog = async (integrationId, channelId) => {
        if (channelId) {
            const response = await axios.get(`/integration/${integrationId}/channel/${channelId}/log`);

            Modal.info({
                title: "Log Channel",
                width: "60vw",
                closable: true,
                centered: true,
                content: (
                    <div>
                        <AceEditor
                            setOptions={{
                                useWorker: false,
                            }}
                            width="100%"
                            value={response.data.data}
                            name="chann.log"
                            theme="github"
                        />
                    </div>
                ),
                onOk() {},
            });
        }
    };

    deployChannel = async (integration, identifier) => {
        try {
            const response = await axios.post(`/integration/${integration}/channel/${identifier}/deploy`);

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

    undeployChannel = async (integration, identifier) => {
        try {
            const response = await axios.post(`/integration/${integration}/channel/${identifier}/undeploy`);

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
