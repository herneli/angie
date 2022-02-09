import { Col, Row, Typography, Table, Input, Divider } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import BasicFilter from "../../components/basic-filter/BasicFilter";
import TagMessageMap from "./tag-messages-map/TagMessageMap";

import T from "i18n-react";

import Utils from "../../common/Utils";

const StatusMap = ({ dataSource, defaultDates, customDateRanges, doSearch, height }) => {
    const [selectedElements, setSelectedElements] = useState([]);
    const [checkedNodes, setCheckedNodes] = useState([]);

    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({});
    const [sort, setSort] = useState({});
    // const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        setPagination({ total: dataSource?.total, showSizeChanger: true });
    }, [dataSource?.total]);

    useEffect(() => {
        doSearch(pagination, filters, sort, checkedNodes);
    }, [filters, checkedNodes]);

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

    const onSearch = (value) => {
        if (value.indexOf(":") !== -1) {
            return setFilters(Utils.getFiltersByPairs((key) => `${key}`, value));
        }
        const filter = {
            tagged_messages: {
                type: "full-text-psql",
                value: value,
            },
        };
        setFilters(value ? filter : {});
    };

    const onDateChange = (dates) => {
        if (dates) {
            setFilters({
                ...filters,
                date_reception: {
                    type: "date",
                    start: dates[0].toISOString(),
                    end: dates[1].toISOString(),
                },
            });
        }
    };

    const baseHeight = `calc(100vh - ${height || 165}px)`;
    const tableHeight = `calc(100vh - ${(height || 165) + 170}px)`;
    return (
        <div>
            <BasicFilter
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
                            record={dataSource?.tags}
                            selection={selectedElements}
                            setSelection={setSelectedElements}
                            checkedNodes={checkedNodes}
                            setCheckedNodes={setCheckedNodes}
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
                                scroll={{ y: tableHeight }}
                                onRow={(record) => ({
                                    onClick: () => {
                                        selectRow(record);
                                    },
                                })}
                                onChange={(pagination, tableFilters, sort) => {
                                    setSort(sort);
                                    setPagination(pagination);
                                    doSearch(pagination, filters, sort, checkedNodes);
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
                                        defaultSortOrder: "descend",
                                        sorter: (a, b) =>
                                            moment(a.date_reception).unix() - moment(b.date_reception).unix(),
                                    },
                                    {
                                        title: T.translate("messages.type"),
                                        dataIndex: ["message_content_type"],
                                        sorter: true,
                                    },
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
                                dataSource={dataSource?.messages}
                            />
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default StatusMap;
