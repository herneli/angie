import { Badge } from "antd";
import React from "react";
import { Handle } from "react-flow-renderer";

import lodash from "lodash";

const TagNode = ({ data, isConnectable }) => {
    const { error_count, success_count, onElementClick } = data;

    const renderBadges = () => {
        const badges = { error: error_count, success: success_count };

        return lodash.map(badges, (el, key) => {
            const style = key === "success" ? { backgroundColor: "#52c41a" } : null;
            return (
                <Badge
                    key={key}
                    count={el || 0}
                    onClick={(e) => {
                        onElementClick(key);
                        e.stopPropagation();
                    }}
                    overflowCount={999999}
                    showZero={true}
                    className={key}
                    style={style}
                />
            );
        });
    };
    return (
        <>
            <Handle type="target" position="left" style={{ background: "#555" }} isConnectable={isConnectable} />
            {renderBadges()}
            <div>{data.label}</div>
            <Handle type="source" position="right" isConnectable={isConnectable} />
        </>
    );
};

export default TagNode;
