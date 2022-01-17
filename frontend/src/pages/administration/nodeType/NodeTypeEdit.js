import { Button, Divider } from "antd";
import { useState } from "react";
import ModelEdit from "../../configuration/ModelEdit";
import NodeEditModal from "../integration/NodeEditModal";

import T from "i18n-react";

import axios from "axios";
import lodash from "lodash";
import AceEditor from "../../../components/ace-editor/AceEditor";
/**
 * Componente wrapper sobre ModelEdit para añadir una forma de probar el componente
 *
 * @param {*} param0
 * @returns
 */
const NodeTypeEdit = ({ model }) => {
    const [currentData, setCurrentData] = useState(null);
    const [testVisible, setTestVisible] = useState(false);
    const [debugData, setDebugData] = useState("");

    const loadTestInfo = async () => {
        setTestVisible(true);
        await getNodeXml(getDefaults(currentData));
    };

    const getNodeXml = async (formData) => {
        try {
            const response = await axios.post("integration_channel/to_camel/specific_node", {
                node_type: {
                    id: currentData.id,
                    code: currentData.code,
                    document_type: "node_type",
                    data: { ...currentData },
                },
                data: { id: "demo", data: formData },
            });

            setDebugData(response?.data?.data);
        } catch (ex) {
            setDebugData(JSON.stringify(ex));
        }
    };

    const getDefaults = (data) => {
        try {
            return { ...JSON.parse(data.defaults), label: data.name };
        } catch (ex) {
            return {};
        }
    };

    const debounced = lodash.debounce(getNodeXml, 200);
    return (
        <div>
            <Button key="test" type="primary" style={{ float: "right" }} onClick={() => loadTestInfo()}>
                {T.translate("administration.node_types.test_button")}
            </Button>
            <ModelEdit model={model} onElementLoad={(data) => setCurrentData(data)} />
            {currentData && (
                <NodeEditModal
                    selectedType={{ id: "demo", type_id: currentData.id, data: getDefaults(currentData) }}
                    nodeTypes={[currentData]}
                    editNodeVisible={testVisible}
                    onEditCancel={() => setTestVisible(false)}
                    onNodeEditEnd={(id, { data }) => console.log(data)}
                    onDataChange={(data) => debounced(data)}>
                    <h4>Camel XML</h4>
                    <Divider />
                    <AceEditor
                        setOptions={{
                            useWorker: false,
                        }}
                        beautify
                        width="100%"
                        height="300px"
                        value={debugData}
                        onChange={(data) => setDebugData(data)}
                        name="camel.code"
                        mode="xml"
                        theme="github"
                    />
                </NodeEditModal>
            )}
        </div>
    );
};

export default NodeTypeEdit;
