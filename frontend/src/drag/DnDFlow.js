import React, { useState, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    removeElements,
    Controls,
    MiniMap,
    Background,
} from 'react-flow-renderer';

import Sidebar from './Sidebar';


import './dnd.css';

const initialElements = [];

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [elements, setElements] = useState(initialElements);

    const onConnect = (params) => {
        console.log(params)
        setElements((els) => addEdge({ ...params, label: 'Conexión' }, els))

    }

    const onElementsRemove = (elementsToRemove) =>
        setElements((els) => removeElements(elementsToRemove, els));

    const onLoad = (_reactFlowInstance) =>
        setReactFlowInstance(_reactFlowInstance);

    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (event) => {
        event.preventDefault();

        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');
        let extra = event.dataTransfer.getData('application/reactflow/extra');
        if (extra && extra != "undefined") extra = JSON.parse(extra);

        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });
        const newNode = {
            id: getId(),
            type,
            position,
            data: { label: `${type} node` },
            sourcePosition: "right",
            targetPosition: "left",
            ...extra
        };
        console.log(extra);

        setElements((es) => es.concat(newNode));
    };

    return (
        <div className="dndflow">
            <ReactFlowProvider>
                <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                    <ReactFlow
                        elements={elements}
                        onConnect={onConnect}
                        onElementsRemove={onElementsRemove}
                        onLoad={onLoad}
                        onDrop={onDrop}
                        deleteKeyCode={46}
                        onDragOver={onDragOver}
                    >
                        <Controls />
                        <MiniMap />
                        <Background />
                    </ReactFlow>
                </div>

                <Sidebar />
            </ReactFlowProvider>
        </div>
    );
};

export default DnDFlow;