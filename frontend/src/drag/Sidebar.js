import React from 'react';

const Sidebar = () => {
    const onDragStart = (event, nodeType, extra) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow/extra', JSON.stringify(extra));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside>
            <div className="description">You can drag these nodes to the pane on the right.</div>
            <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'input', { data: { label: "Entrada" } })} draggable>
                Entrada
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default', { data: { label: "Transformación 1" } })} draggable>
                Transformación 1
            </div>
            <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default', { data: { label: "Transformación 2" } })} draggable>
                Transformación 2
            </div>
            <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output', { data: { label: "Salida" } })} draggable>
                Salida
            </div>
        </aside>
    );
};
export default Sidebar;