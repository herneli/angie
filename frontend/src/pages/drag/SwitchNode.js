import React, { useEffect } from 'react';

import { Handle } from 'react-flow-renderer';


const SwitchNode = ((node) => {

    const SPACE = 20;

    const { data, isConnectable } = node;


    useEffect(() => {

        if (!data.handles) {
            data.handles = [];
        }

    }, [data]);

    // const addHandle = () => {
    //     data.handles = data.handles.concat({ id: "out" + data.handles.length, condition: "a == b" })
    //     if (data.onNodeUpdate) {
    //         data.onNodeUpdate(null, node);
    //     }
    // }

    const height = (data.handles.length) * SPACE;

    return (
        <div style={{ minHeight: 16, height: height }} >
            <Handle
                type="target"
                position="left"
                isConnectable={isConnectable}
            />
            {/* onDoubleClick={addHandle} */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95%" }}> {data.label} </div>

            {data.handles && data.handles.map((el, index) => {
                return <Handle
                    type="source"
                    position="right"
                    key={el.id}
                    id={el.id}
                    style={{ top: ((SPACE) * (index + 1)) }}
                    isConnectable={isConnectable}
                />
            })}

        </div >
    );
});

export default SwitchNode;