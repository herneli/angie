import React, { memo } from 'react';

import { Handle, Position } from 'react-flow-renderer';
import { drawTags } from '../FlowUtils';

const AngieInputNode = ({ data, isConnectable, sourcePosition = Position.Bottom }) => (
  <>
    {drawTags(data.tags)}
    {data.label}
    <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
  </>
);

AngieInputNode.displayName = 'AngieInputNode';

export default memo(AngieInputNode);