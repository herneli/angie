import { Modal } from "antd";
import AceEditor from "../../../components/ace-editor/AceEditor";

export default function MessageDataModal({ visible, onCancel, messageData, integration, channel }) {
    const { node, content, type } = messageData;
    const title = type === "error" ? `Execepción (${node})` : `Body (${node})`;
    const width = type === "error" ? 1000 : 800;
    const mode = type === "error" ? null : "json";
    return (
        <Modal
            title={title}
            visible={visible}
            onCancel={onCancel}
            cancelButtonProps={{ style: { display: "none" } }}
            onOk={onCancel}
            destroyOnClose={true}
            width={width}>
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
