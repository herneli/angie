import { useEffect, useState } from "react";
import { Button, Col, Input, message, notification, Popconfirm, Row, Space, Table, Layout } from "antd";
import axios from "axios";
import moment from "moment";
import lodash from "lodash";

import T from "i18n-react";

import { useHistory } from "react-router";
import { v4 as uuid_v4 } from "uuid";
import Icon from "@mdi/react";
import { mdiCancel, mdiPlayCircle, mdiStopCircle } from "@mdi/js";
import { createUseStyles } from "react-jss";
import ChannelActions from "../administration/integration/ChannelActions";
import { Link } from "react-router-dom";

const { Content } = Layout;
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

const DeployedIntegrations = ({ packageUrl }) => {
    let [dataSource, setDataSource] = useState([]);
    let [dataSourceKeys, setDataSourceKeys] = useState([]);
    let [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({});

    useEffect(() => {
        setPagination({ total: dataSource.total, showSizeChanger: true });
    }, [dataSource]);

    let history = useHistory();

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
            const response = await axios.post("/integration/list", filters);

            if (response && response.data && response.data.data) {
                let integrations = response.data.data;
                setDataSourceKeys(lodash.map(integrations, "id"));

                setDataSource(
                    lodash.map(integrations, (el) => {
                        el.data.package_code = el.package_code;
                        el.data.package_version = el.package_version;
                        return el.data;
                    })
                );
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        search();
    }, []);

    const getIntegrationByChannel = (channel) => {
        //Find integration(parent) FIXME: Lo se, es un poco ñapa, pero no hay posibilidad de obtener una referencia al padre y necesito el id de la integracion.
        return lodash.find(dataSource, (int) => {
            let chann = lodash.find(int.channels, { id: channel.id });
            if (chann != null) {
                return int;
            }
        });
    };

    const drawChannelActionButtons = (record) => {
        let integration = getIntegrationByChannel(record);
        return (
            <Space size="middle">
                {record.enabled && record.status === "Started" && (
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
                {record.enabled && record.status !== "Started" && (
                    <Button
                        key="deploy"
                        type="text"
                        onClick={async () => {
                            await channelActions.deployChannel(integration.id, record.id);
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
                {/* <Button
                    title={T.translate("common.button.edit")}
                    icon={<Icon path={mdiPencil} className={classes.icon} />}
                    type="text"
                    onClick={() => startEdit(record)}
                /> */}
            </Space>
        );
    };

    const columns = [
        {
            title: T.translate("integrations.columns.name"),
            dataIndex: "name",
            key: "name",
            ellipsis: true,
            sorter: true,
            render: (text, record) => {
                if (record.channels) {
                    return (
                        <b>
                            <Link to={`/packages/${record.package_code}/integrations/${record.id}`}>
                                {record.name}{" "}
                            </Link>
                        </b>
                    );
                }
                const integration = getIntegrationByChannel(record);
                return (
                    <Link to={`/packages/${integration.package_code}/integrations/${integration.id}/${record.id}`}>
                        {text}{" "}
                    </Link>
                );
            },
        },
        {
            title: T.translate("integrations.columns.description"),
            dataIndex: "description",
            key: "integration.data->>'description'",
            ellipsis: true,
            sorter: true,
            render: (text, record) => {
                if (record.channels) return <b>{text}</b>;

                return text;
            },
        },
        {
            title: T.translate("integrations.columns.status"),
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 60,
            render: (text, record) => {
                if (record.channels) return;
                return (
                    <div>
                        {!record.enabled && (
                            <Icon path={mdiCancel} size={0.6} color="red" title={T.translate("common.disabled")} />
                        )}
                        {record.enabled && text === "Started" && <span title={text}>🟢</span>}
                        {record.enabled && text === "UNDEPLOYED" && <span title={text}>🔴</span>}
                        {record.enabled && text === "Stopped" && <span title={text}>🟠</span>}
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
            title: T.translate("integrations.columns.messages_sent"),
            dataIndex: "messages_sent",
            key: "messages_sent",
            width: 100,
            render: (text, record) => {
                if (record.channels) return;
                return text;
            },
        },
        {
            title: T.translate("integrations.columns.messages_error"),
            dataIndex: "messages_error",
            key: "messages_error",
            width: 100,
            render: (text, record) => {
                if (record.channels) return;
                return text;
            },
        },
        {
            title: T.translate("integrations.columns.messages_total"),
            dataIndex: "messages_total",
            key: "messages_total",
            width: 100,
            render: (text, record) => {
                if (record.channels) return;
                return text;
            },
        },
        {
            title: T.translate("integrations.columns.last_updated"),
            dataIndex: "last_updated",
            key: "integration.data->>'last_updated'",
            width: 180,
            sorter: true,
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
            pathname: packageUrl + "/integrations/new",
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
        <Content>
            <Row className={classes.card}>
                <Col flex={1}>
                    <Input.Search className={classes.search} onSearch={(element) => onSearch(element)} enterButton />
                </Col>
            </Row>
            <Table
                loading={loading}
                key="integrations-table"
                dataSource={dataSource}
                columns={columns}
                onChange={search}
                pagination={pagination}
                rowKey={"id"}
                childrenColumnName={"channels"}
                bordered
                sort
                size="small"
                expandable={{ expandedRowKeys: dataSourceKeys }}
            />
        </Content>
    );
};

export default DeployedIntegrations;
