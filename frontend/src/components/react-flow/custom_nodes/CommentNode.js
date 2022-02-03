import React from "react";
import Icon from "@mdi/react";
import { mdiCommentTextOutline } from "@mdi/js";

const CommentNode = (node) => {
    const { data } = node;
    return (
        <div
            style={{
                minHeight: 18
            }}>
            <Icon path={mdiCommentTextOutline} size={1}  style={{ float: 'left' }} />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: ".2rem",
                }}>
                {data.label}
                
            </div>
        </div>
    );
};

export default CommentNode;
