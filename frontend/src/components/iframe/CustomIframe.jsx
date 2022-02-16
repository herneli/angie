import { useState } from "react";
import { Spin } from "antd";
import T from "i18n-react";
import { useEffect } from "react";

export default function CustomIframe(props) {
    const [loading, setLoading] = useState(true);
    const { width, height, style, bordered, ...customProps } = props;

    useEffect(() => {
        setLoading(true);
    }, [props.src]);

    const showContent = () => {
        setTimeout(() => {
            setLoading(false);
        }, 300);
    };

    return (
        <div style={{ width: width, height: height, ...style }}>
            {loading ? (
                <div
                    style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: loading ? "50px" : 0,
                        border: bordered && "5px solid #F0F2F5",
                    }}>
                    <Spin tip={T.translate("application.loading")} />
                </div>
            ) : null}
            <iframe
                onLoad={showContent}
                width={width}
                height="100%"
                {...customProps}
                style={loading ? { display: "none" } : null}></iframe>
        </div>
    );
}
