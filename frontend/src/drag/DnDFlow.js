import React, { useState, useRef, useReducer, useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    removeElements,
    Controls,
    MiniMap,
    Background
} from 'react-flow-renderer';

import Sidebar from './Sidebar';

import SwitchNode from './SwitchNode';
import { fromBDToCamel, transformFromBd, transformToBD } from './Transformer';
import Form from "@rjsf/core";

import { v4 as uuid_v4 } from "uuid";
import lodash from 'lodash';

import CodeMirrorExt from '../components/CodeMirrorExt'

import './dnd.css';


const nodeTypes = {
    switchNode: SwitchNode,
};

const getId = () => uuid_v4();



const DnDFlow = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [elements, setElements] = useState([]);
    const [bdModel, setBdModel] = useState({});
    const [selectedTypeId, changeSelection] = useState(null);

    useEffect(() => {
        // Actualiza el título del documento usando la API del navegador
        setBdModel(transformToBD(elements));
    }, [elements]);



    const onConnect = (params) => {
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

    const generateHandleIds = (data) => {
        if (data.handles && data.handles.length !== 0) {
            data.handles = data.handles.map((handle, idx) => {
                if (!handle.id) {
                    handle.id = "out" + (idx) //TODO uuid?
                }
                return handle;
            });
        }
    }
    const onNodeUpdate = (event, node) => {
        setElements((els) => els.map((e) => {
            if (e.id === node.id) {
                e.position = node.position || e.position;
                e.data = node.data || e.data;
                if (e.data.handles) {
                    generateHandleIds(e.data);
                }
            }
            return e;
        }));
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
            data: { ...extra, onNodeUpdate: onNodeUpdate },
            sourcePosition: "right",
            targetPosition: "left",
        };


        setElements((es) => es.concat(newNode));
    };

    return (
        <div>
            <div className="dndflow">
                <ReactFlowProvider>
                    <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                        <ReactFlow
                            elements={elements}
                            onConnect={onConnect}
                            onElementsRemove={onElementsRemove}
                            onLoad={onLoad}
                            onDrop={onDrop}
                            nodeTypes={nodeTypes}
                            deleteKeyCode={46}
                            onDragOver={onDragOver}
                            onNodeDragStop={onNodeUpdate}
                            onNodeDoubleClick={(event, node) => changeSelection(node.id)}
                        >
                            <Controls />
                            <MiniMap />
                            <Background />
                        </ReactFlow>
                    </div>

                    <Sidebar selectedType={elements.find((e) => e.id === selectedTypeId) || {}} />
                </ReactFlowProvider>
            </div>
            <br />
            <div>
                <div style={{
                    float: "left",
                    width: "31vw",
                    margin: 10,
                }}>
                    ReactFlow
                    <CodeMirrorExt
                        value={JSON.stringify(elements, null, 2)}
                        name='rflow.code'
                        options={{
                            lineNumbers: true,
                            mode: 'javascript',
                            matchBrackets: true
                        }} />
                </div>
                <div style={{
                    float: "left",
                    width: "31vw",
                    margin: 10,
                }}>
                    Database &nbsp;&nbsp;&nbsp;
                    <button onClick={() => { setElements(transformFromBd(bdModel, onNodeUpdate)); }}>LoadBD</button>
                    <CodeMirrorExt
                        value={JSON.stringify(bdModel, null, 2)}
                        onChange={(val) => setBdModel(JSON.parse(val))}
                        name='database.code'
                        options={{
                            lineNumbers: true,
                            mode: 'javascript',
                            matchBrackets: true
                        }} />
                </div>
                <div style={{
                    float: "left",
                    width: "31vw",
                    margin: 10,
                }}>
                    Camel
                    <CodeMirrorExt
                        value={fromBDToCamel(transformToBD(elements))}
                        name='camel.code'
                        options={{
                            lineNumbers: true,
                            mode: 'xml'
                        }} />
                </div>

            </div>
        </div>
    );
};

export default DnDFlow;