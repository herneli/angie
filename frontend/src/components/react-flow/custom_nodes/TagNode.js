import { Badge, Col, Divider, Row, Statistic, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Handle } from "react-flow-renderer";
import { ExportOutlined, ImportOutlined } from "@ant-design/icons";

import T from "i18n-react";

import lodash from "lodash";
import axios from "axios";
import Icon from "@mdi/react";
import { mdiRefresh } from "@mdi/js";

const AliveStatus = ({ online }) => {
    return (
        <span className="aliveHealthcheck">
            <span>Status:</span>
            <br />
            <Badge status={online ? "success" : "error"} text={online ? "Online" : "Offline"} size="small" />
        </span>
    );
};

const AliveData = ({ data }) => {
    return (
        <span className="aliveHealthcheck">
            <span>Respuesta:</span>
            <br />
            <div dangerouslySetInnerHTML={{ __html: data }} />
        </span>
    );
};

const TagNode = ({ data, isConnectable }) => {
    const [healthData, setHealthData] = useState(null);

    const { error_sent, success_sent, error_rec, success_rec, onElementClick, healthcheck, tagId } = data;

    const createBadge = (el, key, type) => {
        return (
            <td
                key={key}
                title={T.translate("entity.detail.tooltip_count_" + key)}
                onClick={(e) => {
                    console.log("click");
                    onElementClick(key);
                    e.stopPropagation();
                }}>
                <Statistic
                    value={el || 0}
                    groupSeparator="."
                    decimalSeparator=","
                    valueStyle={{
                        color: key.indexOf("error") === -1 ? "#3f8600" : "#cf1322",
                        fontSize: 18,
                        textAlign: "right",
                    }}
                    prefix={type === "sent" ? <ExportOutlined /> : <ImportOutlined rotate={180} />}
                />
            </td>
        );
    };

    const renderBadges = () => {
        const badgesRec = lodash.map({ error_rec, success_rec }, (el, key) => createBadge(el, key, "rec"));
        const badgesSent = lodash.map({ error_sent, success_sent }, (el, key) => createBadge(el, key, "sent"));
        return [<tr>{badgesRec}</tr>, <tr>{badgesSent}</tr>];
    };

    const renderHealthcheck = (data) => {
        switch (data.type) {
            case "alive":
                return <AliveStatus online={data.status} />;
            case "data":
                return <AliveData data={data.value} />;
            default:
                return;
        }
    };

    const performHealthcheck = async () => {
        try {
            const response = await axios.get(`/checkpoint/${tagId}/healthcheck`);
            setHealthData(response.data.data);
        } catch (ex) {
            console.error(ex);
        }
    };

    useEffect(() => {
        if (healthcheck && healthcheck.url) {
            performHealthcheck();
        }
    }, [healthcheck]);

    return (
        <>
            <Handle type="target" position="left" style={{ background: "#555" }} isConnectable={isConnectable} />
            <div className="info">
                <div>
                    {data.label}{" "}
                    {!lodash.isEmpty(healthcheck) && (
                        <Icon
                            path={mdiRefresh}
                            size={0.6}
                            onClick={performHealthcheck}
                            style={{ cursor: "pointer", float: "right", color: "#3d99f6" }}
                        />
                    )}
                </div>
                <div>{healthData && renderHealthcheck(healthData)}</div>
            </div>
            <div className="badges">
                <table>{renderBadges()}</table>
            </div>
            {/* <table className="badges" flex={"auto"}>
                {renderBadges()}
            </table> */}
            <Handle type="source" position="right" isConnectable={isConnectable} />
        </>
    );
};

export default TagNode;
