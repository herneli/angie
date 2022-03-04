import { useEffect, useState } from "react";
import { message, notification, Select } from "antd";
import axios from "axios";
import T from "i18n-react";
import CustomIframe from "../../components/iframe/CustomIframe";
import Config from "../../common/Config";
import GrafanaFilter from "./GrafanaFilter";
import { useParams } from "react-router-dom";

const { Option } = Select;

const JumContexts = () => {
    const params = useParams();
    const [jumServers, setJumServers] = useState([]);
    const [jumServerSelected, setJumServerSelected] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [grafanaLogged, setGrafanaLogged] = useState(false);
    const [iframeRefresh, setIframeRefresh] = useState("&refresh=5s");
    const [dateTimeRanges, setDateTimeRanges] = useState("");
    const [reload, setReload] = useState(0);

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
                value={jumServerSelected}
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
                const jumServers = response.data;
                if (params.server) {
                    const isValidServer = checkValidServer(params.server, jumServers);
                    if (isValidServer) {
                        setJumServerSelected(params.server);
                        setLoaded(true);
                    } else {
                        message.info(T.translate("monitoring.server_info"));
                    }
                }
                setJumServers(jumServers);
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
    };

    /**
     * Comprueba que el server obtenido a través de la url es válido
     * @param {} serverToCheck - Server obtenido de los params
     * @param {*} integrations
     * @returns
     */
    const checkValidServer = (serverToCheck, servers) => {
        for (let server of servers) {
            if (server?.labels?.jum_name === serverToCheck && server.labels.status === "online") {
                return true;
            }
        }
        return false;
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
                <iframe src={Config.getGrafanaURL()} onLoad={updateGrafanaLogged} style={{ display: "none" }} />
            )}
            <div>
                {drawJumServersSelect()}
                <GrafanaFilter
                    setIframeRefresh={setIframeRefresh}
                    setReload={setReload}
                    setDateTimeRange={setDateTimeRanges}
                />
            </div>

            {loaded && grafanaLogged && (
                <CustomIframe
                    src={`${Config.getGrafanaURL()}/d/7ajyUjt7k/jumangie-servers?orgId=1&refresh=5s&var-jum_name=${jumServerSelected}&theme=light${iframeRefresh}${dateTimeRanges}&kiosk`}
                    frameBorder={0}
                    width={"100%"}
                    height={"100%"}
                    title="JumServers"
                    delay={80}
                    key={`JumMonitoring_${reload}`}
                />
            )}
        </div>
    );
};

export default JumContexts;
