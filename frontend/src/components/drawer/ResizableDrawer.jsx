import React, { useState, useEffect } from "react";
import { Drawer } from "antd";

const resizerStyle = {
    width: 5,
    cursor: "ew-resize",
    padding: "4px 0 0",
    borderTop: "1px solid #ddd",
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "#fff",
};
const resizerStyleLeft = {
    width: 5,
    cursor: "ew-resize",
    padding: "4px 0 0",
    borderTop: "1px solid #ddd",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "#fff",
};

const ResizableDrawer = ({ children, customWidth, ...props }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState(props.width);

    useEffect(() => {
        if (customWidth) {
            setWidth(customWidth);
        } else {
            setWidth(props.width);
        }
    }, [customWidth]);

    const onMouseDown = (e) => {
        setIsResizing(true);
    };

    const onMouseUp = (e) => {
        setIsResizing(false);
    };

    const onMouseMove = (e) => {
        if (isResizing) {
            e.preventDefault();

            let currentOffset = document.body.offsetWidth - (e.clientX - document.body.offsetLeft);
            if (props.placement === "left") {
                currentOffset = e.clientX - document.body.offsetLeft;
            }
            const minWidth = 50;
            const maxWidth = customWidth || 800;
            if (currentOffset > minWidth && currentOffset < maxWidth) {
                setWidth(currentOffset);
            }
        }
    };

    useEffect(() => {
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
    });

    return (
        <Drawer {...props} width={width}>
            <div style={props.placement === "left" ? resizerStyleLeft : resizerStyle} onMouseDown={onMouseDown} />

            {children}
        </Drawer>
    );
};

export default ResizableDrawer;
