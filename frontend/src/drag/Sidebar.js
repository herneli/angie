import React, { useEffect, useState } from 'react';

import Form from "@rjsf/core";
import lodash from 'lodash';

import node_types from './constants/node_types'
import CodeMirrorExt from '../components/CodeMirrorExt';

const Sidebar = ({ selectedType, onNodeUpdate }) => {
    const [formData, setFormData] = useState(null);
    const [formSchema, setFormSchema] = useState(null);
    const [uiSchema, setUiSchema] = useState(null);


    const onDragStart = (event, nodeType, extra) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow/extra', JSON.stringify(extra));
        event.dataTransfer.effectAllowed = 'move';
    };

    useEffect(() => {
        if (selectedType && selectedType.data) {
            const type = lodash.find(node_types, { id: selectedType.data.type_id });
            setFormData(lodash.omit(selectedType.data, ["label", "type_id", 'onNodeUpdate']))
            setFormSchema(type.json_data_schema)
            setUiSchema(type.json_ui_schema)
        }
    }, [selectedType, selectedType.data, selectedType.position]);


    const onFormSubmit = () => {
        if (selectedType && selectedType.data && onNodeUpdate) {
            onNodeUpdate(null, {
                ...selectedType, data: { ...selectedType.data, ...formData }
            })
        }
    }
    const widgets = {
        TextareaWidget: CodeMirrorExt
    };

    return (
        <aside>
            <div className="description">Paleta Nodos</div>


            {node_types.map((type) => (
                <div key={type.id} className={"dndnode " + type.react_component_type} onDragStart={(event) => onDragStart(event, type.react_component_type, { label: type.name, type_id: type.id, ...type.defaults })} draggable>
                    {type.name}
                </div>
            ))}

            <hr />
            {formSchema && formData && <Form
                schema={formSchema}
                formData={formData}
                uiSchema={uiSchema}
                widgets={widgets}
                onChange={e => setFormData(e.formData)}
                onSubmit={() => onFormSubmit()}
                onError={(e) => console.log(e)} />}
        </aside>
    );
};
export default Sidebar;