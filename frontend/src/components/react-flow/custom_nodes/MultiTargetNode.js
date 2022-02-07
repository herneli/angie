import React, { useEffect } from "react";

import { Handle } from "react-flow-renderer";

import lodash from "lodash";

const MultiTargetNode = (node) => {
    const SPACE = 20;

    const { data, isConnectable } = node;

    const calculatePosition = (idx, direction, length) => {
        if (length === 1) {
            return {};
        }
        switch (direction) {
            case "right":
            case undefined:
                return { top: SPACE * (idx + 1) };
            case "bottom":
                return { left: SPACE * (idx + 1) };
            default:
                return {};
        }
    };

    const grouped = lodash.groupBy(data.handles, function (b) {
        return b.position || "right";
    });

    const height = grouped["right"].length * SPACE;
    const width = grouped["bottom"] && grouped["bottom"].length * SPACE;

    return (
        <div style={{ minHeight: 16, height: height, minWidth: width }}>
            <Handle type="target" position="left" isConnectable={isConnectable} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95%" }}>
                {" "}
                {data.label}{" "}
            </div>

            {lodash.map(grouped, (group, index) => {
                return (
                    group &&
                    group.map((el, index) => {
                        return (
                            <Handle
                                type="source"
                                position={el.position || "right"}
                                key={el.id}
                                id={el.id}
                                title={el.title}
                                style={{
                                    ...calculatePosition(index, el.position, group.length),
                                    backgroundColor: el.color,
                                }}
                                isConnectable={isConnectable}
                            />
                        );
                    })
                );
            })}
        </div>
    );
};

export default MultiTargetNode;
