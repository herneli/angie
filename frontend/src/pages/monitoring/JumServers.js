import { useEffect, useState } from "react";
import { notification, Select } from "antd";
import axios from "axios";
import T from "i18n-react";
import CustomIframe from "../../components/iframe/CustomIframe";

const { Option } = Select;

const JumContexts = () => {
    let [jumServers, setJumServers] = useState([]);
    let [jumServerSelected, setJumServerSelected] = useState("");
    let [loaded, setLoaded] = useState(false);
    let [grafanaLogged, setGrafanaLogged] = useState(false);

    const handleJumServerChange = (value) => {
        if (value) {
            setLoaded(true);
        }
        setJumServerSelected(value);
    };

    const drawJumServers = () => {
        let jumServerOptions = [];
        for (const item of jumServers) {
            if (item.labels.status === "online") {
                jumServerOptions.push(<Option value={item.labels.jum_name}>{item.labels.jum_name}</Option>);
            }
        }
        return jumServerOptions;
    };

    const drawJumServersSelect = () => {
        return (
            <Select
                style={{ width: 300 }}
                placeholder={T.translate("messages.jum_server")}
                onChange={handleJumServerChange}>
                {drawJumServers()}
            </Select>
        );
    };
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
    };

    const updateGrafanaLogged = (event) => {
        setGrafanaLogged(true);
    };

    useEffect(() => {
        searchJumServers();
    }, []);

    return (
        <div style={{ height: "100%", display: "flex", gap: ".5rem", flexDirection: "column" }}>
            {grafanaLogged === false && (
                <iframe src="http://localhost:3100" onLoad={updateGrafanaLogged} style={{ display: "none" }} />
            )}
            {drawJumServersSelect()}
            {loaded && grafanaLogged && (
                <CustomIframe
                    src={`http://localhost:3100/d/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=${jumServerSelected}&theme=light&kiosk`}
                    frameBorder={0}
                    width={"100%"}
                    height={"100%"}
                    title="JumServers"
                    delay={80}
                />
            )}
        </div>
    );
};

export default JumContexts;
