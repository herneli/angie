import { useEffect, useState } from "react";
import { notification, Select } from "antd";
import axios from "axios";
import T from "i18n-react";

const { Option } = Select;

const JumContexts = () => {
    let [jumServers, setJumServers] = useState([]);
    let [jumServerSelected, setJumServerSelected] = useState('');
    let [loaded, setLoaded] = useState(false);
    let [grafanaLogged, setGrafanaLogged] = useState(false);

    const handleJumServerChange = (value) => {
        if (value) {
            setLoaded(true);
        }
        setJumServerSelected(value);
    }

    const drawJumServers = () => {
        let jumServerOptions = [];
        for (const item of jumServers) {
            if (item.labels.status === "online") {
                jumServerOptions.push(
                    <Option value={item.labels.jum_name}>{item.labels.jum_name}</Option>
                );
            }
        }
        return jumServerOptions;
    }

    const drawJumServersSelect = () => {
        return (
            <Select style={{ width: 300 }} placeholder={T.translate("messages.jum_server")} onChange={handleJumServerChange} >
                {drawJumServers()}
            </Select>
        );
    }
    const searchJumServers = async () => {
        try {
            const response = await axios.get("/jum_agent/list/scrape");
            if (response && response.data) {
                let jumServers = response.data;
                setJumServers(jumServers);
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
    }

    const updateGrafanaLogged = (event) => {
        setGrafanaLogged(true);
    }

    useEffect(() => {
        searchJumServers();
    }, []);

    return (
        <>
            {grafanaLogged === false &&
                <iframe src="http://localhost:3100" onLoad={updateGrafanaLogged}  style={{ display: 'none'}} />
            }
            {drawJumServersSelect()}
            {loaded && grafanaLogged &&
                <div style={{ diaplay: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', height: '250px' }}>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=6&theme=light"} width='200px' height='100%' frameBorder="0" title="CPU System"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=10&theme=light"} width='100%' height='100%' frameBorder="0" title="Hist CPU System"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=25&theme=light"} width='200px' height='100%' frameBorder="0" title="CPU Process"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=26&theme=light"} width='100%' height='100%' frameBorder="0" title="Hist CPU Process"></iframe>
                    </div>
                    <div style={{ display: 'flex', height: '250px' }}>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=16&theme=light"} width='100%' frameBorder="0" title="JVM Heap"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=27&theme=light"} width='100%' frameBorder="0" title="JVM Non Heap"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-routeId=All&panelId=31&theme=light"} width='100%' frameBorder="0" title="JVM Total"></iframe>
                    </div>
                    <div style={{ display: 'flex', height: '250px' }}>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=29&theme=light"} width='200px' frameBorder="0" title="JVM Threads Peak"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=30&theme=light"} width='200px' frameBorder="0" title="JVM Threads Total Live"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=32&theme=light"} width='200px' frameBorder="0" title="JVM Threads Daemon"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=28&theme=light"} width='100%' frameBorder="0" title="JVM Threads"></iframe>
                    </div>
                    <div style={{ display: 'flex', height: '250px' }}>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=38&theme=light"} width='600px' frameBorder="0" title="DB Conn"></iframe>
                        <iframe src={"http://localhost:3100/d-solo/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=" + jumServerSelected + "&var-jum_id=All&panelId=36&theme=light"} width='600px' frameBorder="0" title="DB Conn Pool"></iframe>
                    </div>
                </div>
            }
        </>
    );
}

export default JumContexts;
