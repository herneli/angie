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

import { useAngieSession } from "../../../components/security/UserContext";
import BasicFilter from "../../../components/basic-filter/BasicFilter";

const defaultDates = [moment().subtract(15, "day"), moment().endOf("day")];

const EntityList = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});
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

    useEffect(() => {
        search();
    }, [currentUser, currentDates]);

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

        if (pagination?.pageSize && pagination?.current) {
            filters.limit = pagination.pageSize ? pagination.pageSize : 10;
            filters.start =
                (pagination.current ? pagination.current - 1 : 0) * (pagination.pageSize ? pagination.pageSize : 10);
        }

        if (sorts) {
            filters.sort = Object.keys(sorts).length !== 0 && {
                field: sorts.columnKey || sorts.field,
                direction: sorts.order,
            };
        }
        if (currentDates) {
            filters["date"] = {
                type: "date",
                start: currentDates[0].toISOString(),
                end: currentDates[1].toISOString(),
            };
        }

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
            dataIndex: "_id",
            key: "_id",
            ellipsis: true,
            sorter: true,
        },
        {
            title: T.translate("entity.date"),
            dataIndex: ["_source", "date"],
            key: "date",
            defaultSortOrder: "descend",
            sorter: true,
            render: (text, record) => {
                return moment(text).format("DD/MM/YYYY HH:mm:ss:SSS");
            },
        },
        {
            title: T.translate("entity.type"),
            dataIndex: ["_source", "type"],
            key: "type.keyword",
            sorter: true,
        },
        {
            title: T.translate("entity.organization"),
            dataIndex: ["_source", "organization"],
            key: "organization.keyword",
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
                                    pathname: `/explore/entity/${record._id}`,
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

    const onDateChange = (dates) => {
        setCurrentDates(dates);
    };
    const onSearch = (value) => {
        const filter = {
            "": {
                type: "query_string",
                value: value,
            },
        };
        search(null, value ? filter : {});
    };

    return (
        <div>
            <BasicFilter defaultDates={defaultDates} onDateChange={onDateChange} onSearch={onSearch} />
            <br />
            {dataSource && (
                <Table
                    loading={loading}
                    key="messages-table"
                    dataSource={dataSource}
                    columns={columns}
                    onChange={search}
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
