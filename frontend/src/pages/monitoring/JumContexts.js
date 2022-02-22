import { useEffect, useState } from "react";
import { notification, Select } from "antd";
import axios from "axios";
import T from "i18n-react";
import CustomIframe from "../../components/iframe/CustomIframe";

const { Option, OptGroup } = Select;

const JumContexts = () => {
    let [channelsByIntegration, setChannelsByIntegration] = useState([]);
    let [channelSelected, setChannelSelected] = useState("");
    let [loaded, setLoaded] = useState(false);
    let [grafanaLogged, setGrafanaLogged] = useState(false);

    const handleChannelChange = (value) => {
        if (value) {
            setLoaded(true);
        }
        setChannelSelected(value);
    };

    const drawIntegrationsChannels = (integration) => {
        let channelsIntegration = [];
        for (const channel of integration.channels) {
            if (channel.enabled && channel.status === "Started") {
                channelsIntegration.push(<Option value={channel.name}>{channel.name}</Option>);
            }
        }
        return channelsIntegration;
    };

    const drawChannels = () => {
        let integrations = [];
        for (const item of channelsByIntegration) {
            integrations.push(
                <OptGroup label={item.integration.name}>{drawIntegrationsChannels(item.integration)}</OptGroup>
            );
        }
        return integrations;
    };

    const drawChannelsSelect = () => {
        return (
            <Select style={{ width: 300 }} placeholder={T.translate("messages.channel")} onChange={handleChannelChange}>
                {drawChannels()}
            </Select>
        );
    };
    const searchChannelsByIntegration = async () => {
        try {
            const response = await axios.get("channel/all_by_integration");
            if (response && response.data && response.data.data) {
                let channelsByIntegration = response.data.data;
                setChannelsByIntegration(channelsByIntegration);
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
    };

    const updateGrafanaLogged = (event) => {
        setGrafanaLogged(true);
    };

    useEffect(() => {
        searchChannelsByIntegration();
    }, []);

    return (
        <div style={{ height: "100%", display: "flex", gap: ".5rem", flexDirection: "column" }}>
            {grafanaLogged === false && (
                <iframe src="http://localhost:3100" onLoad={updateGrafanaLogged} style={{ display: "none" }} />
            )}
            {drawChannelsSelect()}
            {loaded && grafanaLogged && (
                <CustomIframe
                    src={`http://localhost:3100/d/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=${channelSelected}&var-routeId=All&var-routeDescription=All&theme=light&kiosk`}
                    frameBorder={0}
                    width={"100%"}
                    height={"100%"}
                    title="JumContext"
                    delay={80}
                />
            )}
        </div>
    );
};

export default JumContexts;
