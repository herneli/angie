import React, { memo } from 'react';

import { Handle, Position } from 'react-flow-renderer';
import { drawTags } from '../FlowUtils';

const AngieOutputNode = ({ data, isConnectable, targetPosition = Position.Top }) => (
  <>
    <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
    {drawTags(data.tags)}
    {data.label}
  </>
);

AngieOutputNode.displayName = 'AngieOutputNode';

export default memo(AngieOutputNode);