import { useMemo } from "react";
import { getMarkerEnd, useStoreState, getBezierPath, Position, getEdgeCenter, EdgeText } from "react-flow-renderer";

import { getEdgeParams, getNodeIntersection } from "./FlowUtils";

const FloatingEdge = ({
    id,
    source,
    target,
    arrowHeadType,
    markerEndId,
    style,
    label,
    labelStyle,
    labelShowBg,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
}) => {
    const nodes = useStoreState((state) => state.nodes);
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

    const sourceNode = useMemo(() => nodes.find((n) => n.id === source), [source, nodes]);
    const targetNode = useMemo(() => nodes.find((n) => n.id === target), [target, nodes]);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    const d = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
    });
    
    const ax = Math.abs(sx + tx) / 2;
    const ay = Math.abs(sy + ty) / 2;

    const text = label ? (
        <EdgeText
            x={ax}
            y={ay}
            label={label}
            labelStyle={labelStyle}
            labelShowBg={labelShowBg}
            labelBgStyle={labelBgStyle}
            labelBgPadding={labelBgPadding}
            labelBgBorderRadius={labelBgBorderRadius}
        />
    ) : (
        "azs"
    );

    return (
        <g className="react-flow__connection">
            <path id={id} className="react-flow__edge-path" d={d} markerEnd={markerEnd} style={style} />
            {text}
        </g>
    );
};

export default FloatingEdge;
