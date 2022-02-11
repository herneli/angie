import { useEffect, useState } from "react";
import { notification, Select } from "antd";
import axios from "axios";
import T from "i18n-react";

const { Option, OptGroup } = Select;

const JumContexts = () => {
    let [channelsByIntegration, setChannelsByIntegration] = useState([]);
    let [channelSelected, setChannelSelected] = useState('');
    let [loaded, setLoaded] = useState(false);

    const handleChannelChange = (value) => {
        if (value) {
            setLoaded(true);
        }
        setChannelSelected(value);
    }

    const drawIntegrationsChannels = (integration) => {
        let channelsIntegration = [];
        for (const channel of integration.channels) {
            if (channel.enabled && channel.status === "Started") {
                channelsIntegration.push(
                    <Option value={channel.name}>{channel.name}</Option>
                );
            }
        }
        return channelsIntegration;
    }

    const drawChannels = () => {
        let integrations = [];
        for (const item of channelsByIntegration) {
            integrations.push(
                <OptGroup label={item.integration.name}>
                    {drawIntegrationsChannels(item.integration)}
                </OptGroup>
            );
        }
        return integrations;
    }

    const drawChannelsSelect = () => {
        return (
            <Select style={{ width: 300 }} placeholder={T.translate("messages.channel")} onChange={handleChannelChange} >
                {drawChannels()}
            </Select>
        );
    }
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
    }

    useEffect(() => {
        searchChannelsByIntegration();
    }, []);

    return (
        <>
            {drawChannelsSelect()}
            {loaded &&
                <div style={{ diaplay: 'flex', flexDirection: 'column' }}>
                    {/* <AuthIFrame src="http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=Channel&var-routeId=All&var-routeDescription=All&panelId=3&theme=light" 
                type="text/html" /> */}
                    {/* <iframe src="http://localhost:3000" frameborder="0"></iframe>
            <iframe src="http://localhost:3100" frameborder="0"></iframe> */}
                    {/* <iframe src="http://localhost:3100/grafana/d/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=Channel&var-routeId=All&var-routeDescription=All" width={1400} height={800} frameborder="0"></iframe>
            <iframe src="http://localhost:3100/grafana/dashboard/snapshot/eBn0FMvg5lfaNAbcC7fP5BoWtSxHhj3a" width={1400} height={800} frameborder="0"></iframe> */}

                    <div style={{ display: 'flex', height: '125px' }}>
                        <iframe src={"http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=" + channelSelected + "&var-routeId=All&var-routeDescription=All&panelId=3&theme=light"} width='100%' height='100%' frameBorder="0" title="Routes"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=" + channelSelected + "&var-routeId=All&var-routeDescription=All&panelId=4&theme=light"} width='100%' height='100%' frameBorder="0" title="Exchanges total"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=" + channelSelected + "&var-routeId=All&var-routeDescription=All&panelId=5&theme=light"} width='100%' height='100%' frameBorder="0" title="Exchanges succeeded"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=" + channelSelected + "&var-routeId=All&var-routeDescription=All&panelId=6&theme=light"} width='100%' height='100%' frameBorder="0" title="Exchanges failed"></iframe>
                    </div>
                    <div style={{ display: 'flex', height: '275px' }}>
                        <iframe src={"http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=" + channelSelected + "&var-routeId=All&var-routeDescription=All&panelId=7&theme=light"} width='200px' frameBorder="0" title="Ex/sec all"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=" + channelSelected + "&var-routeId=All&var-routeDescription=All&panelId=9&theme=light"} width='100%' frameBorder="0" title="Ex/sec"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=" + channelSelected + "&var-routeId=All&var-routeDescription=All&panelId=10&theme=light"} width='100%' frameBorder="0" title="Ex/sec per route"></iframe>
                    </div>
                    <div style={{ display: 'flex', height: '160px' }}>
                        <iframe src={"http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=" + channelSelected + "&var-routeId=All&var-routeDescription=All&panelId=11&theme=light"} width='100%' frameBorder="0" title="Avg Exec Time"></iframe>
                    </div>
                    <div style={{ display: 'flex', height: '160px' }}>
                        <iframe src={"http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=" + channelSelected + "&var-routeId=All&var-routeDescription=All&panelId=13&theme=light"} width='100%' frameBorder="0" title="Avg Events Time"></iframe>
                    </div>
                    <div style={{ display: 'flex', height: '125px' }}>
                        <iframe src={"http://localhost:3100/d-solo/AfEg2exnz/jumangie-contexts?orgId=1&refresh=5s&var-context=" + channelSelected + "&var-routeId=All&var-routeDescription=All&panelId=12&theme=light"} width='250px' frameBorder="0" title="Example Injects"></iframe>
                    </div>
                </div>
            }
        </>
    );
}

export default JumContexts;
