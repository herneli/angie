import { useEffect, useState } from "react";
import { Button, Col, Input, notification, Row, Table } from "antd";
import axios from "axios";
import moment from "moment";

import T from "i18n-react";

import { useParams } from "react-router";
// import { v4 as uuid_v4 } from "uuid";
import Icon from "@mdi/react";
import { mdiDownload, mdiUpload, mdiEmailOff, mdiEmailCheck } from "@mdi/js";
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
    const params = useParams();
    const channel = params.channel_id;

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

            if (
                channelResponse &&
                channelResponse.data &&
                channelResponse.data.hits &&
                channelResponse.data.hits.hits
            ) {
                const messages = channelResponse.data.hits.hits;
                const totalMessages = channelResponse.data.aggregations.messages.value;

                const parsedMessages = messages.reduce((acc, message) => {
                    const messageData = message._source;
                    const messageId = messageData.breadcrumb_id;
                    const messageStart = message.inner_hits.first.hits.hits[0]._source.date_time;
                    const messageEnd = message.inner_hits.last.hits.hits[0]._source.date_time;
                    const elapsed = moment(messageEnd) - moment(messageStart);

                    const hasErrors = message.inner_hits.all.hits.hits.reduce((hasError, innerMessage) => {
                        if (innerMessage._source.event === "ERROR") {
                            hasError = true;
                        }
                        return hasError;
                    }, false);
                    acc.push({
                        breadcrumb_id: messageId,
                        start: messageStart,
                        end: messageEnd,
                        error: hasErrors,
                        elapsed: elapsed,
                    });
                    return acc;
                }, []);

                setPagination({ ...pagination, total: totalMessages });
                setDataSource(parsedMessages);
                // setDataSourceKeys(lodash.map(messages, "_source"));
                // setDataSource(response.data.hits.hits);
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

    /* const handleOnDownloadModel = (e, row) => {
        const data = [row];
        downloadJsonFile(data, `Integration-${row.name}.json`);
    }; */

    const handleDownloadTable = (data) => {
        downloadJsonFile(data, `channel_${channel}_messages.json`);
    };

    // const drawChannelActionButtons = (record) => {
    //     //Find integration(parent) FIXME: Lo se, es un poco ñapa, pero no hay posibilidad de obtener una referencia al padre y necesito el id de la integracion.
    //     let integration = lodash.find(dataSource, (int) => {
    //         let chann = lodash.find(int.channels, { id: record.id });
    //         if (chann != null) {
    //             return int;
    //         }
    //     });
    //     return (
    //         <Space size="middle">
    //             {/* {record.enabled && record.status === "Started" && (
    //                 <Popconfirm
    //                     title={T.translate("common.question")}
    //                     onConfirm={async () => {
    //                         await channelActions.undeployChannel(integration.id, record.id, false);
    //                         await search();
    //                     }}>
    //                     <Button
    //                         key="undeploy"
    //                         type="text"
    //                         icon={
    //                             <Icon
    //                                 path={mdiStopCircle}
    //                                 className={classes.icon}
    //                                 color="red"
    //                                 title={T.translate("integrations.channel.button.undeploy")}
    //                             />
    //                         }
    //                     />
    //                 </Popconfirm>
    //             )}
    //             {record.enabled && record.status !== "Started" && (
    //                 <Button
    //                     key="deploy"
    //                     type="text"
    //                     onClick={async () => {
    //                         await channelActions.deployChannel(integration.id, record.id, false);
    //                         await search();
    //                     }}
    //                     icon={
    //                         <Icon
    //                             path={mdiPlayCircle}
    //                             color="green"
    //                             className={classes.icon}
    //                             title={T.translate("integrations.channel.button.deploy")}
    //                         />
    //                     }
    //                 />
    //             )} */}
    //         </Space>
    //     );
    // };

    // const drawIntegrationActionButtons = (record) => {
    //     return (
    //         <Space size="middle">
    //             <Button
    //                 icon={<Icon path={mdiDownload} className={classes.icon} />}
    //                 type="text"
    //                 title={T.translate("common.button.download")}
    //                 onClick={(e) => handleOnDownloadModel(e, record)}
    //             />
    //         </Space>
    //     );
    // };

    const columns = [
        {
            title: "Estado",
            dataIndex: "error",
            key: "msg_error",
            width: 25,
            align: "center",

            render: (text) => {
                if (text) {
                    return <Icon path={mdiEmailOff} size="1.5rem" color="red" title="Error" />;
                }

                return <Icon path={mdiEmailCheck} size="1.5rem" color="green" title="Enviado" />;
            },
        },
        {
            title: "Id Mensaje",
            dataIndex: "breadcrumb_id",
            key: "breadcrumb_id",
            width: 200,
            ellipsis: true,
            sorter: true,
        },

        /*  {
            title: "Ruta de origen",
            dataIndex: "origin_route",
            key: "origin_route",
            ellipsis: true,
            sorter: true,
        },
        {
            title: "Ruta actual",
            dataIndex: "current_route",
            key: "current_route",
            ellipsis: true,
            sorter: true,
        },
        {
            title: "Nodo endpoint",
            dataIndex: "node_endpoint",
            key: "node_endpoint",
            ellipsis: true,
            sorter: true,
        }, */

        {
            title: "Fecha de inicio",
            dataIndex: "start",
            key: "start_date",
            sorter: true,
            width: 120,
            render: (text, record) => {
                return moment(text).format("DD/MM/YYYY HH:mm:ss:SSS");
            },
        },
        {
            title: "Fecha de finalización",
            dataIndex: "end",
            key: "end_date",
            sorter: true,
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
            sorter: true,
        },
        /*   {
            title: T.translate("integrations.columns.actions"),
            key: "action",
            width: 240,
            render: (text, record) => {
              
            },
        }, */
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
                                icon={<Icon path={mdiUpload} className={classes.icon} />}
                                type="text"
                                // onClick={() => handleUploadTable()}
                            />
                        </Col>
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
                    // expandable={{ expandedRowKeys: dataSourceKeys }}
                />
            )}
        </Content>
    );
};

export default Messages;
