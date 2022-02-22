import { useState } from "react";
import { Spin } from "antd";
import T from "i18n-react";
import { useEffect } from "react";

export default function CustomIframe(props) {
    const [loading, setLoading] = useState(false);
    const { width, height, style, onLoad, delay = 300, bordered, ...customProps } = props;

    useEffect(() => {
        setLoading(true);
    }, [props.src]);

    const showContent = () => {
        //El timeout se utiliza para compensar el tiempo de carga del contenido del iframe
        setTimeout(() => {
            setLoading(false);
        }, delay);
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
                onLoad={(e) => {
                    if (onLoad) {
                        onLoad(e);
                    }
                    showContent();
                }}
                width={width}
                height="100%"
                {...customProps}
                style={loading ? { display: "none" } : null}></iframe>
        </div>
    );
}
