import { useEffect, useState } from "react";
import { Button, notification, Table, Space } from "antd";
import axios from "axios";
import moment from "moment";
import Message from "./Message";
import { getMessageTraces } from "./Message";
import T from "i18n-react";
import { useParams } from "react-router";
import Icon from "@mdi/react";
import { mdiDownload, mdiEmailOff, mdiEmailCheck, mdiMagnifyPlus } from "@mdi/js";
import { createUseStyles } from "react-jss";
import { Content } from "antd/lib/layout/layout";
import BasicFilter from "../../../components/basic-filter/BasicFilter";
import Utils from "../../../common/Utils";

const useStyles = createUseStyles({
    card: {
        margin: 10,
    },
    search: {
        marginBottom: 15,
    },
    button: {
        fontSize: 10,
    },
    icon: {
        color: "#3d99f6",
        width: 20,
        height: 20,
    },
});

const defaultDates = [moment().subtract(15, "day"), moment().endOf("day")];

const Messages = (props) => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({ showSizeChanger: true });
    const [sort, setSort] = useState({});

    const [messageModalVisible, setMessageModalVisible] = useState(false);
    const [detailedMessage, setDetailedMessage] = useState([]);
    const [currentDates, setCurrentDates] = useState(defaultDates);

    const params = useParams();
    let channel = "";
    let integration = "";

    if (props.channel) {
        channel = props.channel.id;
        integration = params.id;
    } else {
        channel = params.channel_id;
        integration = params.integration_id;
    }

    useEffect(() => {
        search(pagination, filters, sort);
    }, [props.debugData]);

    const classes = useStyles();

    const search = async (pagination, filters = {}, sorts) => {
        setLoading(true);

        filters.channel_id = channel;

        
        filters.limit = pagination?.pageSize || 10;
        filters.start = (pagination?.current - 1 || 0) * (pagination?.pageSize || 10);

        if (sorts?.order) {
            filters.sort =
                Object.keys(sorts).length !== 0
                    ? {
                          field: sorts.columnKey || sorts.field,
                          direction: sorts.order,
                      }
                    : { field: "date_reception", direction: "descend" };
        }

        if (currentDates) {
            filters["date_reception"] = {
                type: "date",
                start: currentDates[0].toISOString(),
                end: currentDates[1].toISOString(),
            };
        }

        try {
            const channelResponse = await axios.post(`/messages/list`, filters);
            if (channelResponse?.data) {
                const { data: messages, total: totalMessages } = channelResponse.data;

                const parsedMessages = messages.map((message) => {
                    const { message_id, status, date_processed, date_reception } = message;

                    const elapsed = moment(date_processed) - moment(date_reception) || "---";

                    return {
                        breadcrumb_id: message_id,
                        start: date_reception,
                        end: date_processed,
                        elapsed: elapsed,
                        status: status,
                    };
                });

                setPagination({ ...pagination, total: totalMessages });
                setDataSource(parsedMessages);
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
        setLoading(false);
    };

    const downloadJsonFile = (data, filename) => {
        let filedata = JSON.stringify(data, null, 2);
        const blob = new Blob([filedata], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;
        link.click();
    };

    const handleDownloadTable = (data) => {
        downloadJsonFile(data, `channel_${channel}_messages.json`);
    };

    const handleDownloadMessage = async (record) => {
        const data = await getMessageTraces(channel, record.breadcrumb_id);

        downloadJsonFile(data, `channel_${channel}_message${record.breadcrumb_id}_traces.json`);
    };

    const drawMessageActions = (record) => {
        return (
            <Space size="middle">
                <Button
                    key="showMessage"
                    title={T.translate("messages.show_traces")}
                    type="text"
                    onClick={(e) => {
                        setDetailedMessage(record);
                        setMessageModalVisible(true);
                    }}
                    icon={<Icon path={mdiMagnifyPlus} className={classes.icon} />}
                />
                <Button
                    key="downloadMessage"
                    title={T.translate("messages.download_traces")}
                    type="text"
                    onClick={(e) => {
                        handleDownloadMessage(record);
                    }}
                    icon={<Icon path={mdiDownload} className={classes.icon} />}
                />
            </Space>
        );
    };

    const columns = [
        {
            title: T.translate("messages.status"),
            dataIndex: "status",
            key: "status",
            width: 50,
            align: "center",
            sorter: true,
            render: (text, record) => {
                if (text === "error") {
                    return <Icon path={mdiEmailOff} size="1.5rem" color="red" title={T.translate("common.error")} />;
                }
                return <Icon path={mdiEmailCheck} size="1.5rem" color="green" title={T.translate("messages.sent")} />;
            },
        },

        {
            title: T.translate("messages.message_id"),
            dataIndex: "breadcrumb_id",
            key: "message_id",
            width: 200,
            ellipsis: true,
            sorter: true,
        },
        {
            title: T.translate("messages.date_reception"),
            dataIndex: "start",
            key: "date_reception",
            defaultSortOrder: "descend",
            sorter: true,
            width: 120,
            render: (text, record) => {
                return moment(text).format("DD/MM/YYYY HH:mm:ss:SSS");
            },
        },
        {
            title: T.translate("messages.date_processed"),
            dataIndex: "end",
            key: "date_processed",
            sorter: true,
            width: 120,
            render: (text) => {
                if (text) {
                    return moment(text).format("DD/MM/YYYY HH:mm:ss:SSS");
                }
                return "---";
            },
        },
        {
            title: T.translate("messages.elapsed"),
            dataIndex: "elapsed",
            key: "elapsed'",
            width: 80,
        },
        {
            title: T.translate("integrations.columns.actions"),
            key: "action",
            width: 50,
            fixed: "right",
            render: (text, record) => {
                return drawMessageActions(record);
            },
        },
    ];

    const onSearch = ({ filter, dates }) => {
        let newFilters = {};
        if (filter && filter.indexOf(":") !== -1) {
            newFilters = Utils.getFiltersByPairs((key) => `${key}`, filter);
        } else if (filter) {
            newFilters["zmessages"] = {
                type: "full-text-psql",
                value: filter,
            };
        }

        if (dates) {
            newFilters["date_reception"] = {
                type: "date",
                start: dates[0].toISOString(),
                end: dates[1].toISOString(),
            };
        }

        setFilters(newFilters);
        search(pagination, newFilters, sort);
    };

    return props.channel ? (
        <>
            {dataSource && (
                <Table
                    loading={loading}
                    key="messages-table"
                    dataSource={dataSource}
                    columns={columns}
                    onChange={() => search(pagination, filters, sort)}
                    pagination={pagination}
                    rowKey={"id"}
                    childrenColumnName={"channels"}
                    bordered
                    sort
                    scroll={{ x: 1100 }}
                    size="small"
                />
            )}
            {messageModalVisible && (
                <Message
                    classes={classes}
                    visible={messageModalVisible}
                    messageData={detailedMessage}
                    integration={integration}
                    channel={channel}
                    onCancel={() => {
                        setDetailedMessage([]);
                        setMessageModalVisible(false);
                    }}></Message>
            )}
        </>
    ) : (
        <Content>
            <BasicFilter defaultDates={defaultDates} onSearch={onSearch}>
                <Button
                    icon={<Icon path={mdiDownload} className={classes.icon} />}
                    type="text"
                    onClick={() => handleDownloadTable(dataSource)}
                />
            </BasicFilter>
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
                />
            )}
            {messageModalVisible && (
                <Message
                    classes={classes}
                    visible={messageModalVisible}
                    messageData={detailedMessage}
                    integration={integration}
                    channel={channel}
                    onCancel={() => {
                        setDetailedMessage([]);
                        setMessageModalVisible(false);
                    }}></Message>
            )}
        </Content>
    );
};

export default Messages;
