import React, { memo } from 'react';
import { Handle, Position } from "react-flow-renderer";
import { drawTags } from '../FlowUtils';

const AngieDefaultNode = ({
    data,
    isConnectable,
    targetPosition = Position.Top,
    sourcePosition = Position.Bottom,
}) => (
    <>
        <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
        {drawTags(data.tags)}
        {data.label}
        <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
    </>
);

AngieDefaultNode.displayName = 'AngieDefaultNode';

export default memo(AngieDefaultNode);