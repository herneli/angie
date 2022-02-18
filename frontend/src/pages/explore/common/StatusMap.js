import { Col, Row, Typography, Table, Input, Divider } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import BasicFilter from "../../../components/basic-filter/BasicFilter";
import TagMessageMap from "./tag-messages-map/TagMessageMap";

import T from "i18n-react";

import Utils from "../../../common/Utils";
import { useAngieSession } from "../../../providers/security/UserContext";

const StatusMap = ({
    tags,
    dataSource,
    defaultDates,
    customDateRanges,
    doMapLoad,
    doTableLoad,
    height,
    mapLoading,
    tableLoading,
}) => {
    const [selectedElements, setSelectedElements] = useState([]);
    const [checkedNodes, setCheckedNodes] = useState([]);

    const [searchValue, setSearchValue] = useState("");

    const [filters, setFilters] = useState({});
    const [dateFilters, setDateFilters] = useState({});
    const [pagination, setPagination] = useState();
    const [sort, setSort] = useState({});
    const { currentUser } = useAngieSession();

    // const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        setPagination({ total: dataSource?.total, showSizeChanger: true });
    }, [dataSource?.total]);

    useEffect(() => {
        doTableLoad(pagination, filters, sort, checkedNodes);
        doMapLoad(filters, checkedNodes);
    }, [currentUser]);

    const rowSelection = {
        selectedRowKeys: selectedElements,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedElements(selectedRowKeys);
        },
    };
    const selectRow = (record) => {
        const selectedRowKeys = [...selectedElements];
        if (selectedRowKeys.indexOf(record.message_id) >= 0) {
            selectedRowKeys.splice(selectedRowKeys.indexOf(record.message_id), 1);
        } else {
            selectedRowKeys.push(record.message_id);
        }
        setSelectedElements(selectedRowKeys);
    };

    const onTagSelected = (filter) => {
        console.log(filter);
        setSearchValue(filter);
        if (filter) {
            onSearch(filter);
        }
    };

    const onSearch = (value) => {
        console.log('oli')
        let newFilters = {};
        if (value.indexOf(":") !== -1) {
            newFilters = Utils.getFiltersByPairs((key) => `${key}`, value);
        } else if (value) {
            newFilters = {
                tagged_messages: {
                    type: "full-text-psql",
                    value: value,
                },
            };
        }

        setFilters(newFilters);
        doTableLoad(pagination, { ...dateFilters, ...newFilters }, sort, checkedNodes);
        doMapLoad({ ...dateFilters, ...newFilters }, checkedNodes);
    };

    const onDateChange = (dates) => {
        if (dates) {
            const newDateFilters = {
                date_reception: {
                    type: "date",
                    start: dates[0].toISOString(),
                    end: dates[1].toISOString(),
                },
            };
            setDateFilters(newDateFilters);
            doTableLoad(pagination, { ...filters, ...newDateFilters }, sort, checkedNodes);
            doMapLoad({ ...filters, ...newDateFilters }, checkedNodes);
        }
    };

    const onCheckedChange = (checkedNodes) => {
        setCheckedNodes(checkedNodes);
        doTableLoad(pagination, { ...filters, ...dateFilters }, sort, checkedNodes);
        doMapLoad({ ...filters, ...dateFilters }, checkedNodes);
    };

    const baseHeight = `calc(100vh - ${height || 165}px)`;
    const tableHeight = `calc(100vh - ${(height || 165) + 170}px)`;
    return (
        <div>
            <BasicFilter
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                defaultDates={defaultDates}
                onDateChange={onDateChange}
                onSearch={onSearch}
                customDateRanges={customDateRanges}
            />

            <br />
            <div>
                <Row style={{}}>
                    <Col span={10}>
                        <TagMessageMap
                            record={tags}
                            selection={selectedElements}
                            setSelection={onTagSelected}
                            onCheckedChange={onCheckedChange}
                            loading={mapLoading}
                        />
                    </Col>
                    <Col span={14} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: 15, height: baseHeight }}>
                        <Typography.Title level={5}>{T.translate("entity.detail.messages")}</Typography.Title>
                        {dataSource && (
                            <Table
                                rowKey="message_id"
                                rowSelection={{
                                    type: "checkbox",
                                    ...rowSelection,
                                }}
                                loading={tableLoading}
                                scroll={{ y: tableHeight }}
                                onRow={(record) => ({
                                    onClick: () => {
                                        selectRow(record);
                                    },
                                })}
                                onChange={(pagination, tableFilters, sort) => {
                                    setSort(sort);
                                    setPagination(pagination);
                                    doTableLoad(pagination, filters, sort, checkedNodes);
                                }}
                                pagination={pagination}
                                columns={[
                                    {
                                        title: T.translate("messages.message_id"),
                                        dataIndex: ["message_content_id"],
                                        sorter: true,
                                    },
                                    {
                                        title: T.translate("messages.date_reception"),
                                        dataIndex: ["date_reception"],
                                        render: (text) => {
                                            return moment(text).format("DD/MM/YYYY HH:mm:ss:SSS");
                                        },
                                        sorter: true,
                                        defaultSortOrder: "descend",
                                    },
                                    {
                                        title: T.translate("messages.type"),
                                        dataIndex: ["message_content_type"],
                                        sorter: true,
                                    },
                                    // {
                                    //     title: T.translate("messages.tags"),
                                    //     dataIndex: ["tags"],
                                    //     sorter: true,
                                    // },
                                    {
                                        title: T.translate("messages.channel"),
                                        dataIndex: ["channel_name"],
                                        sorter: true,
                                    },
                                    {
                                        title: "",
                                        dataIndex: ["status"],
                                        sorter: true,
                                        width: 50,
                                        render: (text) => {
                                            if (text === "error") {
                                                return <span title={text}>🔴</span>;
                                            }
                                            return <span title={text}>🟢</span>;
                                        },
                                    },
                                ]}
                                dataSource={dataSource?.data}
                            />
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default StatusMap;
