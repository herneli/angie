import { Typography } from "antd";
import { useState } from "react";

const EllipsisParagraph = ({ text, maxChars }) => {
    const [expanded, setExpanded] = useState(false);

    const ellipsis = (currText) => {
        if (!currText) return "";
        const splitted = currText.split("\n");
        return splitted[0].substring(0, maxChars || 200);
    };

    const renderText = (currText) => {
        if(!currText) return "";
        
        if (currText.length < maxChars || expanded) {
            return text;
        }

        if (!expanded) {
            return ellipsis(text) + "...";
        }
    };

    return (
        <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }} type="secondary">
            {renderText(text)}

            {!expanded && text && text.length > maxChars && (
                <Typography.Link onClick={() => setExpanded(true)}> mas</Typography.Link>
            )}
            {expanded && (
                <Typography.Link onClick={() => setExpanded(false)}>
                    <br /> menos
                </Typography.Link>
            )}
        </Typography.Paragraph>
    );
};

export default EllipsisParagraph;
