import { Col, Row, Typography, Table, Input, Divider } from "antd";
import moment from "moment";
import { useState } from "react";
import BasicFilter from "../../components/basic-filter/BasicFilter";
import TagMessageMap from "./tag-messages-map/TagMessageMap";

import T from "i18n-react";

const defaultDates = [moment().subtract(1, "day"), moment()];

const StatusMap = ({ record, onDateChange, customDateRanges, onSearch, height }) => {
    const [selectedElements, setSelectedElements] = useState([]);

    const rowSelection = {
        selectedRowKeys: selectedElements,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedElements(selectedRowKeys);
        },
    };
    const selectRow = (record) => {
        const selectedRowKeys = [...selectedElements];
        if (selectedRowKeys.indexOf(record._id) >= 0) {
            selectedRowKeys.splice(selectedRowKeys.indexOf(record._id), 1);
        } else {
            selectedRowKeys.push(record._id);
        }
        setSelectedElements(selectedRowKeys);
    };

    const baseHeight = `calc(100vh - ${height || 165}px)`;
    const tableHeight = `calc(100vh - ${(height || 165) + 100}px)`;
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
                            record={record}
                            selection={selectedElements}
                            setSelection={setSelectedElements}
                        />
                    </Col>
                    <Col span={14} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: 15, height: baseHeight }}>
                        <Typography.Title level={5}>{T.translate("entity.detail.messages")}</Typography.Title>
                        {record && (
                            <Table
                                rowKey="_id"
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
                                pagination={false}
                                columns={[
                                    {
                                        title: T.translate("messages.message_id"),
                                        dataIndex: ["_source", "message_id"],
                                    },
                                    {
                                        title: T.translate("messages.date_reception"),
                                        dataIndex: ["_source", "date_reception"],
                                        render: (text) => {
                                            return moment(text).format("DD/MM/YYYY HH:mm:ss:SSS");
                                        },
                                        defaultSortOrder: "descend",
                                        sorter: (a, b) =>
                                            moment(a._source.date_reception).unix() -
                                            moment(b._source.date_reception).unix(),
                                    },
                                    {
                                        title: T.translate("messages.type"),
                                        dataIndex: ["_source", "message_type"],
                                    },
                                    {
                                        title: T.translate("messages.channel"),
                                        dataIndex: ["_source", "channel_name"],
                                    },
                                    {
                                        title: "",
                                        dataIndex: ["_source", "status"],
                                        width: 50,
                                        render: (text) => {
                                            if (text === "error") {
                                                return <span title={text}>🔴</span>;
                                            }
                                            return <span title={text}>🟢</span>;
                                        },
                                    },
                                ]}
                                dataSource={record.raw_messages}
                            />
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default StatusMap;
