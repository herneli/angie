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
                <CustomIframe
                    src={`http://localhost:3100/d/5JC-1cank/angie?orgId=1&from=1645507839716&to=1645529439716&theme=light&kiosk`}
                    frameBorder={0}
                    width={"100%"}
                    height={"100%"}
                    title="Angie"
                    delay={50}
                />
            )}
        </>
    );
};

export default JumContexts;
