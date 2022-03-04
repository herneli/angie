import { Button, Divider, Modal, Select, Tooltip } from "antd";
import { useState } from "react";
import AceEditor from "../../../components/ace-editor/AceEditor";
import T from "i18n-react";
import Icon from "@mdi/react";
import { mdiAccount, mdiHomeGroup, mdiHome, mdiLogout, mdiInformationOutline } from "@mdi/js";
import { RightCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function MessageDataModal({ visible, onCancel, messageData, integration, channel,route,nodes, groupedMessages, resendMessage }) {
    const { title, content, type } = messageData;
    const [endpoint, setEndpoint] = useState([]);
    const width = type === "error" ? 1000 : 800;
    const mode = type === "error" ? null : "json";

    const getNodes = () => {
        let nextNodes = []

        let after = false

        
        groupedMessages.forEach(element => {
            if(element.node == route.node){
                after = true
                return
            }
            if(after == true){
                let node = nodes.find(item => { return element.node == item.label })
                nextNodes.push(<Option value={node.id}>{node.label}</Option>) 
            }
        })

        return nextNodes
    }

    return (
        <Modal
            title={title}
            visible={visible}
            onCancel={onCancel}
            cancelButtonProps={{ style: { display: "none" } }}
            onOk={onCancel}
            destroyOnClose={true}
            width={width}>
            {route ? 
            <>
            <h4>{T.translate("messages.resend")} <Tooltip placement="right" title={T.translate("messages.resend_info")}><Icon size={0.8} style={{color: "blue"}} path={mdiInformationOutline} /></Tooltip></h4>
            <Select
                placeholder={T.translate("messages.resend_body")}
                onChange={(e) => { 
                   setEndpoint(e) 
                }}>
             {getNodes()}
            </Select>
            <Button
                icon={<RightCircleOutlined />}
                disabled={!content || content.includes("[Body is instance of") || content.includes("com.roche.angie")  }
                title={
                    content
                        ? "Resend"
                        : "Resend"
                }
                onClick={() => {
                    if(endpoint.length > 0){
                        resendMessage(content, endpoint)
                    }
                }}
            />
            </> : ""}
            
            <Divider></Divider>
            <AceEditor
                width="100%"
                beautify
                setOptions={{
                    useWorker: false,
                }}
                value={content}
                mode={mode}
                theme="github"
                readOnly
            />
        </Modal>
    );
}
