import React, { useEffect } from "react";

import { Handle } from "react-flow-renderer";

const MultiTargetNode = (node) => {
    const SPACE = 20;

    const { data, isConnectable } = node;

    const height = data.handles.length * SPACE;
    return (
        <div style={{ minHeight: 16, height: height }}>
            <Handle type="target" position="left" isConnectable={isConnectable} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95%" }}>
                {" "}
                {data.label}{" "}
            </div>

            {data.handles &&
                data.handles.map((el, index) => {
                    return (
                        <Handle
                            type="source"
                            position="right"
                            key={el.id}
                            id={el.id}
                            title={el.title}
                            style={{ top: SPACE * (index + 1), backgroundColor: el.color }}
                            isConnectable={isConnectable}
                        />
                    );
                })}
        </div>
    );
};

export default MultiTargetNode;
