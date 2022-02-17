import { useState } from "react";
import CustomIframe from "../../components/iframe/CustomIframe";

const JumContexts = () => {
    let [grafanaLogged, setGrafanaLogged] = useState(false);

    const updateGrafanaLogged = (event) => {
        setGrafanaLogged(true);
    };

    return (
        <>
            {grafanaLogged === false && (
                <iframe src="http://localhost:3100" onLoad={updateGrafanaLogged} style={{ display: "none" }} />
            )}
            {grafanaLogged && (
                <div style={{ diaplay: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", height: "250px" }}>
                        <CustomIframe
                            src="http://localhost:3100/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=2&theme=light"
                            width="100%"
                            frameBorder="0"
                            title="CPU"
                            bordered
                        />
                    </div>
                    <div style={{ display: "flex", height: "250px" }}>
                        <CustomIframe
                            src="http://localhost:3100/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=4&theme=light"
                            width="100%"
                            frameBorder="0"
                            title="Memory"
                            bordered
                        />
                    </div>
                    <div style={{ display: "flex", height: "250px" }}>
                        <CustomIframe
                            src="http://localhost:3100/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=6&theme=light"
                            width="100%"
                            frameBorder="0"
                            title="Event loop delay"
                            bordered
                        />
                    </div>
                    <div style={{ display: "flex", height: "250px" }}>
                        <CustomIframe
                            src="http://localhost:3100/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=8&theme=light"
                            width="100%"
                            frameBorder="0"
                            title="Handlers"
                            bordered
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default JumContexts;
