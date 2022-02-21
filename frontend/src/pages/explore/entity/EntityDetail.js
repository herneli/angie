import { Breadcrumb, Divider, notification, Spin, Typography } from "antd";
import { useRef } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import DynamicDetail from "../../../components/dynamic-detail/DynamicDetail";
import lodash from "lodash";

import T from "i18n-react";

import * as api from "../../../api/configurationApi";
import { Link } from "react-router-dom";
import MessagesStatusMap from "../messages/MessagesStatusMap";

const EntityDetail = ({ record }) => {
    const detail = useRef(null);
    const [loading, setLoading] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(record);
    const [organizations, setOrganizations] = useState([]);
    const [detailHeight, setDetailHeight] = useState(0);

    const { state } = useLocation();
    const { id } = useParams();

    const [basePattern, setBasePattern] = useState({
        id: {
            label: T.translate("entity.id"),
        },
        entity_type_name: {
            label: T.translate("entity.type"),
        },
        date: {
            label: T.translate("entity.date"),
            type: "date",
            format: "DD/MM/YYYY HH:mm:ss.SSS",
        },
    });

    //currentRecord.type  //TODO .detail

    const initialize = async () => {
        await loadOrganizations();
    };

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        loadElement();
    }, [state]);

    const loadElement = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/entity/" + id);

            if (response) {
                let record = response?.data?.data;
                let entity_detail = response?.data?.data?.entity_type?.data?.entity_detail;
                setCurrentRecord(record);
                if (entity_detail != null && entity_detail != "") {
                    setBasePattern(JSON.parse(entity_detail));
                }
                setDetailHeight(getDetailHeight());
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
            console.error(ex);
        }
        setLoading(false);
    };

    /**
     * Obtiene una organización en base a su id
     * @param {*} id
     * @returns
     */
    const getOrganizationById = (id) => {
        if (!id) return null;
        const org = lodash.find(organizations, { id: id });
        if (!org) return null;
        const data = { ...org, ...org.data };
        return data.name;
    };

    /**
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadOrganizations = async () => {
        try {
            const organizations = await api.getModelDataList("organization");
            setOrganizations(organizations);
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
            console.error(ex);
        }
    };

    const getDetailHeight = () => {
        try {
            return detail.current.clientHeight + 220;
        } catch (e) {
            return 430;
        }
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignContent: "stretch" }}>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <Link to="/explore/entity">{T.translate("menu.explore.entity")}</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {T.translate("entity.detail.breadcrumb", { id: currentRecord && currentRecord.id })}
                </Breadcrumb.Item>
            </Breadcrumb>
            <br />
            <Spin spinning={loading}>
                {/* <pre>{JSON.stringify(currentRecord, null, 2)}</pre> */}

                <div ref={detail}>
                    {/* <Typography.Title level={4}>{T.translate("entity.detail.title")}</Typography.Title> */}
                    {currentRecord && (
                        <DynamicDetail
                            options={{ size: "small", bordered: true,/* layout: "vertical"*/ }}
                            pattern={basePattern}
                            data={currentRecord}
                            helpers={{
                                getOrganizationById: (value) => getOrganizationById(value),
                            }}
                        />
                    )}
                    <br />
                    <Divider orientation="left">{T.translate("entity.detail.messages")}</Divider>
                </div>
                {currentRecord && <MessagesStatusMap height={detailHeight} entity={currentRecord} />}
            </Spin>
        </div>
    );
};

export default EntityDetail;
