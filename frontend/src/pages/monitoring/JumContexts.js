import { useEffect, useState } from "react";
import { message, notification, Select } from "antd";
import axios from "axios";
import T from "i18n-react";
import CustomIframe from "../../components/iframe/CustomIframe";
import Config from "../../common/Config";
import GrafanaFilter from "./GrafanaFilter";
import { useParams } from "react-router-dom";

const { Option, OptGroup } = Select;

const JumContexts = () => {
    const params = useParams();
    const [channelsByIntegration, setChannelsByIntegration] = useState([]);
    const [channelSelected, setChannelSelected] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [grafanaLogged, setGrafanaLogged] = useState(false);
    const [iframeRefresh, setIframeRefresh] = useState("&refresh=5s");
    const [dateTimeRanges, setDateTimeRanges] = useState("");
    const [reload, setReload] = useState(0);

    const handleChannelChange = (value) => {
        if (value) {
            setLoaded(true);
        }
        setChannelSelected(value);
    };

    const drawIntegrationsChannels = (integration) => {
        let channelsIntegration = [];

        for (const channel of integration.channels) {
            const channelName = channel.name;

            if (channel.enabled && channel.status === "Started") {
                channelsIntegration.push(<Option value={channelName}>{channelName}</Option>);
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
            <Select
                style={{ width: 300 }}
                value={channelSelected}
                placeholder={T.translate("messages.channel")}
                onChange={handleChannelChange}>
                {drawChannels()}
            </Select>
        );
    };

    const searchChannelsByIntegration = async () => {
        try {
            const response = await axios.get("channel/all_by_integration");
            if (response && response.data && response.data.data) {
                let channelsByIntegration = response.data.data;

                if (params.channel) {
                    const isValidChannel = checkValidChannel(params.channel, channelsByIntegration);
                    if (isValidChannel) {
                        setChannelSelected(params.channel);
                        setLoaded(true);
                    } else {
                        message.info(T.translate("monitoring.channel_info"));
                    }
                }

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

    /**
     * Comprueba que el canal obtenido a través de la url es válido
     * @param {} channelToCheck - Canal obtenido de los params
     * @param {*} integrations
     * @returns
     */
    const checkValidChannel = (channelToCheck, integrations) => {
        for (let integration of integrations) {
            for (let channel of integration.integration.channels) {
                if (channel.name === channelToCheck && channel.status === "Started") {
                    return true;
                }
            }
        }
        return false;
    };

    useEffect(() => {
        searchChannelsByIntegration();
    }, []);

    return (
        <div style={{ height: "100%", display: "flex", gap: ".5rem", flexDirection: "column" }}>
            {grafanaLogged === false && (
                <iframe src={Config.getGrafanaURL()} onLoad={updateGrafanaLogged} style={{ display: "none" }} />
            )}
            <div>
                {drawChannelsSelect()}
                <GrafanaFilter
                    setIframeRefresh={setIframeRefresh}
                    setReload={setReload}
                    setDateTimeRange={setDateTimeRanges}
                />
            </div>
            {loaded && grafanaLogged && (
                <CustomIframe
                    src={`${Config.getGrafanaURL()}/d/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=${channelSelected}&var-routeId=All&var-routeDescription=All&theme=light${iframeRefresh}${dateTimeRanges}&kiosk`}
                    frameBorder={0}
                    width={"100%"}
                    height={"100%"}
                    title="JumContext"
                    delay={80}
                    key={`ChannelMonitoring_${reload}`}
                />
            )}
        </div>
    );
};

export default JumContexts;
