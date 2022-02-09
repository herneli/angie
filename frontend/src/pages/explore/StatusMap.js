import { Col, Row, Typography, Table, Input, Divider } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import BasicFilter from "../../components/basic-filter/BasicFilter";
import TagMessageMap from "./tag-messages-map/TagMessageMap";

import T from "i18n-react";

import lodash from "lodash";

const StatusMap = ({ record, defaultDates, onDateChange, customDateRanges, onSearch, height }) => {
    const [selectedElements, setSelectedElements] = useState([]);

    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        if (record?.tags) {
            const grouped = lodash.groupBy(record?.tags, "message_id");

            setDataSource(
                lodash.map(grouped, (grp) => {
                    return { ...grp[0] };
                })
            );
        }
    }, [record?.tags]);

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
                                pagination={false}
                                columns={[
                                    {
                                        title: T.translate("messages.message_id"),
                                        dataIndex: ["message_content_id"],
                                    },
                                    {
                                        title: T.translate("messages.date_reception"),
                                        dataIndex: ["msg_date_reception"],
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
                                    },
                                    {
                                        title: T.translate("messages.channel"),
                                        dataIndex: ["channel_name"],
                                    },
                                    {
                                        title: "",
                                        dataIndex: ["status"],
                                        width: 50,
                                        render: (text) => {
                                            if (text === "error") {
                                                return <span title={text}>🔴</span>;
                                            }
                                            return <span title={text}>🟢</span>;
                                        },
                                    },
                                ]}
                                dataSource={dataSource}
                            />
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default StatusMap;
