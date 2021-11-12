import { useEffect, useState } from "react";
import { Button, Col, Input, notification, Popconfirm, Row, Space, Table } from "antd";
import axios from "axios";
import moment from "moment";
import lodash from "lodash";

import T from "i18n-react";

import { useHistory } from "react-router";
import { v4 as uuid_v4 } from "uuid";
import Icon from "@mdi/react";
import {
    mdiContentCopy,
    mdiDelete,
    mdiDownload,
    mdiPencil,
    mdiPlayCircle,
    mdiPlus,
    mdiStopCircle,
    mdiUpload,
} from "@mdi/js";
import { createUseStyles } from "react-jss";
import ChannelActions from "./ChannelActions";

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

const channelActions = new ChannelActions();

const Integrations = () => {
    let [dataSource, setDataSource] = useState([]);
    let [dataSourceKeys, setDataSourceKeys] = useState([]);
    let [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({});

    useEffect(() => {
        setPagination({ total: dataSource.total, showSizeChanger: true });
    }, [dataSource]);

    let history = useHistory();

    const classes = useStyles();

    const startEdit = (record) => {
        history.push({
            pathname: "/admin/integration/" + record.id,
            state: {
                record: record,
            },
        });
    };

    const onElementDelete = async (record) => {
        setLoading(true);
        try {
            const response = await axios.delete(`/integration/${record.id}`);

            if (response?.data?.success) {
                search();
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
        setLoading(false);
    };

    const search = async (pagination, filters = {}) => {
        setLoading(true);

        if (pagination?.pageSize && pagination?.current) {
            filters.limit = pagination.pageSize ? pagination.pageSize : 10;
            filters.start =
                (pagination.current ? pagination.current - 1 : 0) * (pagination.pageSize ? pagination.pageSize : 10);
        }

        try {
            const response = await axios.post("/integration/list", filters);

            if (response && response.data && response.data.data) {
                let integrations = response.data.data;
                setDataSourceKeys(lodash.map(integrations, "id"));

                setDataSource(lodash.map(integrations, "data"));
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
        setLoading(false);
    };

    const saveIntegration = async (integration) => {
        await axios.post("/integration", integration);
        await search();
    };

    const handleOnDuplicateModel = async (e, row) => {
        const newItem = {
            ...row,
            id: null,
            created_on: moment().toISOString(),
            last_updated: moment().toISOString(),
            name: `${row.name} CLONED`,
        };
        for (let chann of newItem.channels) {
            chann.id = uuid_v4();
            chann.created_on = moment().toISOString();
            chann.last_updated = moment().toISOString();
            chann.version = 0;
        }

        await saveIntegration(newItem);
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

    const uploadJsonFile = () => {
        return new Promise((resolve, reject) => {
            const uploadFile = (file) => {
                try {
                    var reader = new FileReader();
                    reader.onload = (readerEvent) => {
                        var content = readerEvent.target.result; // this is the content!
                        var data = JSON.parse(content);
                        resolve(data);
                    };
                    reader.readAsText(file, "UTF-8");
                } catch (error) {
                    reject(error);
                }
            };

            var input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json";
            input.onchange = (e) => uploadFile(e.target.files[0]);
            input.click();
        });
    };

    const handleOnDownloadModel = (e, row) => {
        const data = [row];
        downloadJsonFile(data, `Integration-${row.name}.json`);
    };

    const handleDownloadTable = (data) => {
        downloadJsonFile(data, `Integrations.json`);
    };

    const handleUploadTable = () => {
        uploadJsonFile()
            .then((importItems) => {
                const promises = importItems.map((item) => saveIntegration({ ...item, id: null }, false));
                Promise.all(promises).then((values) => {
                    notification.success({
                        message: T.translate("configuration.end_of_loading_json_file"),
                    });
                });
            })
            .catch((error) =>
                notification.error({
                    message: T.translate("configuration.error_loading_json_file"),
                })
            );
    };

    useEffect(() => {
        search();
    }, []);

    const drawChannelActionButtons = (record) => {
        //Find integration(parent) FIXME: Lo se, es un poco ñapa, pero no hay posibilidad de obtener una referencia al padre y necesito el id de la integracion.
        let integration = lodash.find(dataSource, (int) => {
            let chann = lodash.find(int.channels, { id: record.id });
            if (chann != null) {
                return int;
            }
        });
        return (
            <Space size="middle">
                {record.status === "STARTED" && (
                    <Popconfirm
                        title={T.translate("common.question")}
                        onConfirm={async () => {
                            await channelActions.undeployChannel(integration.id, record.id, false);
                            await search();
                        }}>
                        <Button
                            key="undeploy"
                            type="text"
                            icon={
                                <Icon
                                    path={mdiStopCircle}
                                    className={classes.icon}
                                    color="red"
                                    title={T.translate("integrations.channel.button.undeploy")}
                                />
                            }
                        />
                    </Popconfirm>
                )}
                {record.status !== "STARTED" && (
                    <Button
                        key="deploy"
                        type="text"
                        onClick={async () => {
                            await channelActions.deployChannel(integration.id, record.id, false);
                            await search();
                        }}
                        icon={
                            <Icon
                                path={mdiPlayCircle}
                                color="green"
                                className={classes.icon}
                                title={T.translate("integrations.channel.button.deploy")}
                            />
                        }
                    />
                )}
            </Space>
        );
    };

    const drawIntegrationActionButtons = (record) => {
        return (
            <Space size="middle">
                <Button
                    title={T.translate("common.button.edit")}
                    icon={<Icon path={mdiPencil} className={classes.icon} />}
                    type="text"
                    onClick={() => startEdit(record)}
                />
                <Popconfirm
                    title={T.translate("configuration.do_you_want_to_duplicate_the_item")}
                    onConfirm={(e) => handleOnDuplicateModel(e, record)}>
                    <Button
                        icon={<Icon path={mdiContentCopy} className={classes.icon} />}
                        type="text"
                        title={T.translate("common.button.duplicate")}
                    />
                </Popconfirm>
                <Button
                    icon={<Icon path={mdiDownload} className={classes.icon} />}
                    type="text"
                    title={T.translate("common.button.download")}
                    onClick={(e) => handleOnDownloadModel(e, record)}
                />
                <Popconfirm title={T.translate("common.question")} onConfirm={() => onElementDelete(record)}>
                    <Button
                        icon={<Icon path={mdiDelete} className={classes.icon} />}
                        type="text"
                        title={T.translate("common.button.delete")}
                    />
                </Popconfirm>
            </Space>
        );
    };

    const columns = [
        {
            title: T.translate("integrations.columns.name"),
            dataIndex: "name",
            key: "name",
            ellipsis: true,
        },
        {
            title: T.translate("integrations.columns.description"),
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: T.translate("integrations.columns.status"),
            dataIndex: "status",
            key: "status",
            align: 'center',
            width: 60,
            render: (text, record) => {
                if (record.channels) return;
                return (
                    <div>
                        {!record.enabled && <span>DISABLED</span>}
                        {record.enabled && text === "STARTED" && <span title={text}>🟢</span>}
                        {record.enabled && text === "UNDEPLOYED" && <span title={text}>🔴</span>}
                        {record.enabled && text === "STOPPED" && <span title={text}>🟠</span>}
                    </div>
                );
            },
        },
        {
            title: T.translate("integrations.columns.version"),
            dataIndex: "version",
            key: "version",
            width: 80,
            render: (text, record) => {
                return text;
            },
        },
        {
            title: T.translate("integrations.columns.message_count"),
            dataIndex: "message_count",
            key: "message_count",
            width: 100,
            render: (text, record) => {
                if (record.channels) return;
                return text;
            },
        },
        {
            title: T.translate("integrations.columns.last_updated"),
            dataIndex: "last_updated",
            key: "last_updated",
            width: 180,
            render: (text, record) => {
                return moment(text).format("DD/MM/YYYY HH:mm:ss");
            },
        },
        {
            title: T.translate("integrations.columns.actions"),
            key: "action",
            width: 200,
            render: (text, record) => {
                if (!record.channels) {
                    return drawChannelActionButtons(record);
                }
                if (record.channels) {
                    return drawIntegrationActionButtons(record);
                }
            },
        },
    ];

    const addIntegration = () => {
        history.push({
            pathname: "/admin/integration/new",
            state: {
                new: true,
                record: {
                    id: "new",
                    name: "",
                    description: "",
                    created_on: moment().toISOString(),
                    channels: [],
                },
            },
        });
    };

    const getFiltersByPairs = (str) => {
        const regex = /(?<key>[^:]+):(?<value>[^\s]+)\s?/g; // clave:valor clave2:valor2
        let m;

        let data = {};
        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            let { key, value } = m.groups;
            if (key) {
                data[key] = {
                    type: "likeI",
                    value: `%${value}%`,
                };
            }
        }
        return data;
    };

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
        <div>
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
                                onClick={() => handleUploadTable()}
                            />
                        </Col>
                        <Col>
                            <Button
                                icon={<Icon path={mdiDownload} className={classes.icon} />}
                                type="text"
                                onClick={() => handleDownloadTable(dataSource)}
                            />
                        </Col>
                        <Col>
                            <Button
                                title={T.translate("common.button.add")}
                                icon={<Icon path={mdiPlus} className={classes.icon} />}
                                type="text"
                                onClick={addIntegration}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Table
                loading={loading}
                key="integrations-table"
                dataSource={dataSource}
                columns={columns}
                pagination={pagination}
                rowKey={"id"}
                childrenColumnName={"channels"}
                bordered
                size="small"
                expandable={{ expandedRowKeys: dataSourceKeys }}
            />
        </div>
    );
};

export default Integrations;
