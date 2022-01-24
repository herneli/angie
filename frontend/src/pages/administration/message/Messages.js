import { useEffect, useState } from "react";
import { Button, Col, Input, notification, Row, Table, Space } from "antd";
import axios from "axios";
import moment from "moment";
import Message from "./Message";
import T from "i18n-react";
import { useParams } from "react-router";
// import { v4 as uuid_v4 } from "uuid";
import Icon from "@mdi/react";
import { mdiDownload, mdiEmailOff, mdiEmailCheck, mdiMagnifyPlus } from "@mdi/js";
import { createUseStyles } from "react-jss";
import { Content } from "antd/lib/layout/layout";

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

// const channelActions = new ChannelActions();

const Messages = ({ packageUrl }, props) => {
    const [dataSource, setDataSource] = useState([]);
    // const [dataSourceKeys, setDataSourceKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});
    const [messageModalVisible, setMessageModalVisible] = useState(false);
    const [detailedMessage, setDetailedMessage] = useState([]);

    const params = useParams();
    const { channel_id: channel, integration_id: integration } = params;

    useEffect(() => {
        search();
    }, []);

    const classes = useStyles();

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

        try {
            const channelResponse = await axios.post(`/messages/${channel}`, filters);
            // const messageCount = await axios.get(`/messages/${channel}/count`, filters);

            if (channelResponse?.data?.hits?.hits) {
                const messages = channelResponse.data.hits.hits;
                const totalMessages = channelResponse.data.hits.total.value;
                console.log(messages);

                const parsedMessages = messages.map((messageData) => {
                    const messageId = messageData._id;
                    const message = messageData._source;
                    const { status, date_processed, date_reception } = message;
                    const elapsed = moment(date_processed) - moment(date_reception);

                    return {
                        breadcrumb_id: messageId,
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

    const handleDownloadMessage = (data) => {
        downloadJsonFile(data, `channel_${channel}_message${data.breadcrumb_id}.json`);
    };

    const drawMessageActions = (record) => {
        return (
            <Space size="middle">
                <Button
                    key="showMessage"
                    type="text"
                    onClick={(e) => {
                        setDetailedMessage(record);
                        setMessageModalVisible(true);
                    }}
                    icon={<Icon path={mdiMagnifyPlus} className={classes.icon} title={"Ver en detalle"} />}
                />
                <Button
                    key="downloadMessage"
                    type="text"
                    onClick={(e) => {
                        handleDownloadMessage(record);
                    }}
                    icon={<Icon path={mdiDownload} className={classes.icon} title={"Descargar"} />}
                />
            </Space>
        );
    };

    const columns = [
        //TODO: Traducir nombres de los campos
        {
            title: "Estado",
            dataIndex: "status",
            key: "status",
            width: 25,
            align: "center",

            render: (text, record) => {
                if (text === "error") {
                    return <Icon path={mdiEmailOff} size="1.5rem" color="red" title="Error" />;
                }

                return <Icon path={mdiEmailCheck} size="1.5rem" color="green" title="Enviado" />;
            },
        },

        {
            title: "Id Mensaje",
            dataIndex: "breadcrumb_id",
            key: "breadcrumb_id.keyword",
            width: 200,
            ellipsis: true,
            sorter: true,
        },
        {
            title: "Fecha de inicio",
            dataIndex: "start",
            key: "date_reception",
            sorter: true,
            width: 120,
            render: (text, record) => {
                return moment(text).format("DD/MM/YYYY HH:mm:ss:SSS");
            },
        },
        {
            title: "Fecha de finalización",
            dataIndex: "end",
            key: "date_processed",
            width: 120,
            render: (text) => {
                return moment(text).format("DD/MM/YYYY HH:mm:ss:SSS");
            },
        },
        {
            title: "Elapsed",
            dataIndex: "elapsed",
            key: "elapsed'",
            width: 80,
        },
        {
            title: T.translate("integrations.columns.actions"),
            key: "action",
            width: 50,
            render: (text, record) => {
                return drawMessageActions(record);
            },
        },
    ];

    // const getFiltersByPairs = (str) => {
    //     const regex = /(?<key>[^:]+):(?<value>[^\s]+)\s?/g; // clave:valor clave2:valor2
    //     let m;

    //     let data = {};
    //     while ((m = regex.exec(str)) !== null) {
    //         // This is necessary to avoid infinite loops with zero-width matches
    //         if (m.index === regex.lastIndex) {
    //             regex.lastIndex++;
    //         }
    //         let { key, value } = m.groups;
    //         if (key) {
    //             data[key] = {
    //                 type: "likeI",
    //                 value: `%${value}%`,
    //             };
    //         }
    //     }
    //     return data;
    // };

    const onSearch = (value) => {
        // if (value.indexOf(":") !== -1) {
        //     return search(null, getFiltersByPairs(value));
        // }
        if (value) {
            search(null, {
                "integration.data::text": {
                    type: "jsonb",
                    value: value,
                },
            });
        }
    };

    return (
        <Content>
            <Row className={classes.card}>
                <Col flex={1}>
                    <Input.Search className={classes.search} onSearch={(element) => onSearch(element)} enterButton />
                </Col>
                <Col flex={2}>
                    <Row justify="end" gutter={10}>
                        <Col>
                            <Button
                                icon={<Icon path={mdiDownload} className={classes.icon} />}
                                type="text"
                                onClick={() => handleDownloadTable(dataSource)}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
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
                    size="small"
                />
            )}
            {messageModalVisible && (
                <Message
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
