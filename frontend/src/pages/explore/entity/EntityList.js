import { useEffect, useState } from "react";
import { notification, Space, Table } from "antd";
import axios from "axios";
import moment from "moment";
import T from "i18n-react";
import { mdiMagnifyPlus } from "@mdi/js";
import IconButton from "../../../components/button/IconButton";
import { useHistory } from "react-router";

import lodash from "lodash";

import * as api from "../../../api/configurationApi";

import { useAngieSession } from "../../../providers/security/UserContext";
import BasicFilter from "../../../components/basic-filter/BasicFilter";
import { Link } from "react-router-dom";
import Utils from "../../../common/Utils";

const defaultDates = [moment().subtract(15, "day"), moment().endOf("day")];

const EntityList = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState();
    const [sort, setSort] = useState({});

    const [organizations, setOrganizations] = useState([]);
    const [currentDates, setCurrentDates] = useState(defaultDates);

    const { currentUser } = useAngieSession();

    let history = useHistory();

    const initialize = async () => {
        await loadOrganizations();
    };

    useEffect(() => {
        initialize();
    }, []);

    // useEffect(() => {
    //     search();
    // }, [currentUser, currentDates]);
    useEffect(() => {
        search(pagination, filters, sort);
    }, [currentUser]);

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
            console.error(ex);
        }
    };

    const search = async (pagination, filters = {}, sorts) => {
        setLoading(true);

        filters.limit = pagination?.pageSize || 10;
        filters.start = (pagination?.current - 1 || 0) * (pagination?.pageSize || 10);

        filters.sort =
            sorts && Object.keys(sorts).length !== 0
                ? {
                      field: sorts.columnKey || sorts.field,
                      direction: sorts.order,
                  }
                : { field: "data->>'date'", direction: "descend" };

        try {
            const response = await axios.post(`/entity/list`, filters);

            setPagination({ ...pagination, total: response?.data?.total });
            setDataSource(response?.data?.data);
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
            console.error(ex);
        }
        setLoading(false);
    };

    const columns = [
        {
            title: T.translate("entity.id"),
            dataIndex: "id",
            key: "id::bigint",//!FIXME... si los ids tienen texto esto no ordena
            ellipsis: true,
            sorter: true,
            render: (text) => <Link to={`/explore/entity/${text}`}>{text}</Link>,
        },
        {
            title: T.translate("entity.date"),
            dataIndex: ["data", "date"],
            key: "data->>'date'",
            defaultSortOrder: "descend",
            sorter: true,
            render: (text, record) => {
                return moment(text).format("DD/MM/YYYY HH:mm:ss:SSS");
            },
        },
        {
            title: T.translate("entity.type"),
            dataIndex: ["data", "type"],
            key: "data->>'type'",
            sorter: true,
        },
        {
            title: T.translate("entity.organization"),
            dataIndex: ["data", "organization"],
            key: "data->>'organization'",
            sorter: true,
            render: (text) => getOrganizationById(text)?.name,
        },
        {
            key: "action",
            width: 50,
            fixed: "right",
            render: (text, record) => {
                return (
                    <Space size="middle">
                        <IconButton
                            type="text"
                            onClick={(e) => {
                                history.push({
                                    pathname: `/explore/entity/${record.id}`,
                                });
                            }}
                            icon={{
                                path: mdiMagnifyPlus,
                                color: "#3d99f6",
                                size: 0.6,
                                title: T.translate("entity.detail"),
                            }}
                        />
                    </Space>
                );
            },
        },
    ];

    const onSearch = ({ filter, dates }) => {
        let newFilters = {};
        if (filter && filter.indexOf(":") !== -1) {
            newFilters = Utils.getFiltersByPairs((key) => `${key}`, filter);
        } else if (filter) {
            newFilters["zentity"] = {
                type: "full-text-psql",
                value: filter,
            };
        }
        if (dates) {
            newFilters["data->>'date'"] = {
                type: "dateraw",
                start: dates[0].toISOString(),
                end: dates[1].toISOString(),
            };
        }

        setFilters(newFilters);
        search(pagination, newFilters, sort);
    };

    return (
        <div>
            <BasicFilter defaultDates={defaultDates} onSearch={onSearch} />
            <br />
            {dataSource && (
                <Table
                    loading={loading}
                    key="messages-table"
                    dataSource={dataSource}
                    columns={columns}
                    onChange={(pagination, tableFilters, sort) => {
                        setSort(sort);
                        setPagination(pagination);
                        search(pagination, filters, sort);
                    }}
                    pagination={pagination}
                    rowKey={"id"}
                    childrenColumnName={"channels"}
                    bordered
                    sort
                    scroll={{ x: 1100 }}
                    size="small"
                />
            )}
        </div>
    );
};

export default EntityList;
