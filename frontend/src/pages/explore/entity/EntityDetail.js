import { Breadcrumb, Divider, notification, Spin, Typography } from "antd";
import { useRef } from "react";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import DynamicDetail from "../../../components/dynamic-detail/DynamicDetail";
import StatusMap from "../StatusMap";
import lodash from "lodash";

import T from "i18n-react";

import * as api from "../../../api/configurationApi";
import { Link } from "react-router-dom";

const defaultDates = [moment().subtract(1, "day"), moment().endOf("day")];

const EntityDetail = ({ record }) => {
    const detail = useRef(null);
    const [loading, setLoading] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(record);
    const [currentDates, setCurrentDates] = useState(defaultDates);
    const [organizations, setOrganizations] = useState([]);
    const [detailHeight, setDetailHeight] = useState(0);

    const { state } = useLocation();
    const { id } = useParams();

    const basePattern = {
        id: {
            label: T.translate("entity.id"),
            style: {
                // fontSize: "120%",
            },
        },
        "type": {
            label: T.translate("entity.type"),
        },
        "arrayTest": {
            label: "Paciente",
        },
        "entity": {
            // span: 2,
            label: "Origen",
        },
        "date": {
            label: T.translate("entity.date"),
            type: "date",
            format: "DD/MM/YYYY HH:mm:ss.SSS",
        },
        "organization": {
            label: T.translate("entity.organization"),
            render: (value) => getOrganizationById(value)?.name,
        },
    };

    const initialize = async () => {
        await loadOrganizations();
    };

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        loadElement();
    }, [state, currentDates]);

    const loadElement = async (filter) => {
        setLoading(true);
        try {
            const msg_filters = filter || {};
            if (currentDates) {
                msg_filters["date_reception"] = {
                    type: "date",
                    start: currentDates[0].toISOString(),
                    end: currentDates[1].toISOString(),
                };
            }

            const response = await axios.get("/entity/" + id, {
                params: {
                    msg_filters,
                },
            });

            if (response) {
                setCurrentRecord(response?.data?.data);
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
        return { ...org, ...org.data };
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

    const onDateChange = (dates) => {
        setCurrentDates(dates);
    };
    const onSearch = (value) => {
        loadElement(
            value && {
                "": {
                    type: "query_string",
                    value: value,
                },
            }
        );
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
                    <Typography.Title level={4}>{T.translate("entity.detail.title")}</Typography.Title>
                    {currentRecord && (
                        <DynamicDetail
                            options={{ size: "small", bordered: true, layout: "vertical" }}
                            pattern={basePattern}
                            data={currentRecord}
                        />
                    )}
                    <br />
                    <Divider orientation="left">{T.translate("entity.detail.messages")}</Divider>
                </div>
                <StatusMap
                    defaultDates={defaultDates}
                    record={currentRecord}
                    onDateChange={onDateChange}
                    onSearch={onSearch}
                    height={detailHeight}
                />
            </Spin>
        </div>
    );
};

export default EntityDetail;
