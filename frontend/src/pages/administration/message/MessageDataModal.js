import { Modal } from "antd";
import AceEditor from "../../../components/ace-editor/AceEditor";

export default function MessageDataModal({ visible, onCancel, messageData, integration, channel }) {
    const { node, content } = messageData;

    return (
        <Modal
            title={`Body (${node})`}
            visible={visible}
            onCancel={onCancel}
            cancelButtonProps={{ style: { display: "none" } }}
            onOk={onCancel}
            destroyOnClose={true}
            width={800}>
            <AceEditor
                width="100%"
                beautify
                setOptions={{
                    useWorker: false,
                }}
                value={content}
                mode="json"
                theme="github"
                readOnly
            />
        </Modal>
    );
}
