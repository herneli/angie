import { Button } from "antd";
import { useState } from "react";
import ModelEdit from "../../configuration/ModelEdit";
import NodeEditModal from "../integration/NodeEditModal";

import T from "i18n-react";

/**
 * Componente wrapper sobre ModelEdit para añadir una forma de probar el componente
 *
 * @param {*} param0
 * @returns
 */
const NodeTypeEdit = ({ model }) => {
    const [currentData, setCurrentData] = useState(null);
    const [testVisible, setTestVisible] = useState(false);

    const getDefaults = (data) => {
        try {
            return { ...JSON.parse(data.defaults) };
        } catch (ex) {
            return {};
        }
    };
    return (
        <div>
            <Button key="test" type="primary" style={{ float: "right" }} onClick={() => setTestVisible(true)}>
                {T.translate("administration.node_types.test_button")}
            </Button>
            <ModelEdit model={model} onElementLoad={(data) => setCurrentData(data)} />
            {currentData && (
                <NodeEditModal
                    selectedType={{ type_id: currentData.id, data: getDefaults(currentData) }}
                    nodeTypes={[currentData]}
                    editNodeVisible={testVisible}
                    onEditCancel={() => setTestVisible(false)}
                    onNodeEditEnd={(id, { data }) => console.log(data)}
                />
            )}
        </div>
    );
};

export default NodeTypeEdit;
