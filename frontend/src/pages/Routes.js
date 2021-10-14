import React, { useState, useRef, useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    removeElements,
    Controls,
    MiniMap,
    Background
} from 'react-flow-renderer';

import CodeMirrorExt from '../components/CodeMirrorExt'
import Sidebar from './drag/Sidebar';
import SwitchNode from './drag/SwitchNode';
import { fromBDToCamel, transformFromBd, transformToBD } from './drag/Transformer';

import { v4 as uuid_v4 } from "uuid";
import axios from 'axios';


import './drag/Routes.css';


const nodeTypes = {
    switchNode: SwitchNode,
};

const getId = () => uuid_v4();
const JUM_ANGIE_URL = "http://localhost:6100";


const Routes = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [elements, setElements] = useState([]);
    const [bdModel, setBdModel] = useState({});
    const [selectedTypeId, changeSelection] = useState(null);
    const [deployed, setDeployed] = useState(false);


    const onConnect = (params) => {
        setElements((els) => addEdge({ ...params, label: 'Conexión' /*TODO Parametrizar*/ }, els))
    }
    const onElementsRemove = (elementsToRemove) =>
        setElements((els) => removeElements(elementsToRemove, els));

    const onLoad = (_reactFlowInstance) =>
        setReactFlowInstance(_reactFlowInstance);

    // Evento al finalizar el drag de los nodos
    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    //Genera los identificadores de los handles de un nodo
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

    //Evento desencadenado al actualizar un nodo
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


    //Evento desencadenado al desplegar un nodo sobre el panel
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


    //Testing: Esto es provisional, se realizara desde el backend
    const sendCamelCommand = async (deploy) => {
        const camelRoutes = fromBDToCamel(transformToBD(elements));

        if (deploy) {
            await axios({
                method: 'post',
                url: `${JUM_ANGIE_URL}/create`,
                data: {
                    "routeId": "R0001",
                    "routeConfiguration": camelRoutes
                }
            });
            setDeployed(true)
        } else {
            await axios({
                method: 'post',
                url: `${JUM_ANGIE_URL}/stop?routeId=R0001`
            });
            setDeployed(false)
        }
    }

    //Testing: Esto es provisional, se realizara desde el backend
    const checkDeployed = async () => {
        const response = await axios({
            method: 'get',
            url: `${JUM_ANGIE_URL}/list`
        });
        if (response && response.data && response.data.length !== 0) {
            setDeployed(true);
        }
    };



    useEffect(() => {
        // Actualiza el título del documento usando la API del navegador
        setBdModel(transformToBD(elements));
    }, [elements]);


    useEffect(() => {
        checkDeployed()
    }, []);

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

                    <Sidebar selectedType={elements.find((e) => e.id === selectedTypeId) || {}} onNodeUpdate={onNodeUpdate} />
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
                    <button onClick={() => { setElements(transformFromBd(bdModel, onNodeUpdate)); }}>LoadFromBD</button>
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
                    Camel &nbsp;&nbsp;&nbsp;
                    {deployed === false && <button onClick={() => { sendCamelCommand(!deployed) }}>deploy</button>}
                    {deployed === true && <button onClick={() => { sendCamelCommand(!deployed) }}>undeploy</button>}
                    {deployed === true ? <span style={{ float: 'right' }}>🟢</span> : <span style={{ float: 'right' }}>🔴</span>}
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

export default Routes;