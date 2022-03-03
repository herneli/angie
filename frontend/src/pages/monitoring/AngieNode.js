import { useState } from "react";
import GrafanaFilter from "./GrafanaFilter";
import Config from "../../common/Config";
import CustomIframe from "../../components/iframe/CustomIframe";

const JumContexts = () => {
    const [grafanaLogged, setGrafanaLogged] = useState(false);
    const [iframeRefresh, setIframeRefresh] = useState("&refresh=5s");
    const [dateTimeRanges, setDateTimeRanges] = useState("");
    const [reload, setReload] = useState(0);

    const updateGrafanaLogged = (event) => {
        setGrafanaLogged(true);
    };

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: ".5rem" }}>
            <GrafanaFilter
                setIframeRefresh={setIframeRefresh}
                setReload={setReload}
                setDateTimeRange={setDateTimeRanges}
            />
            {grafanaLogged === false && (
                <iframe src={Config.getGrafanaURL()} onLoad={updateGrafanaLogged} style={{ display: "none" }} />
            )}
            {grafanaLogged && (
                <CustomIframe
                    src={`${Config.getGrafanaURL()}/d/5JC-1cank/angie?orgId=1&theme=light${iframeRefresh}${dateTimeRanges}&kiosk`}
                    frameBorder={0}
                    width={"100%"}
                    height={"100%"}
                    title="Angie"
                    delay={50}
                    key={`AngieMonitoring_${reload}`}
                />
            )}
        </div>
    );
};

export default JumContexts;
