import { useEffect, useState } from "react";
import { notification, Row, Table, Layout, Space, Popconfirm, Button, Modal } from "antd";
import axios from "axios";
import lodash from "lodash";

import T from "i18n-react";

import { createUseStyles } from "react-jss";
import {
    mdiCancel,
    mdiCheck,
    mdiCheckCircleOutline,
    mdiCloseCircleOutline,
    mdiReload,
    mdiTextLong,
    mdiTrashCan,
} from "@mdi/js";
import Icon from "@mdi/react";

import AceEditor from "react-ace";
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

const Agents = () => {
    let [dataSource, setDataSource] = useState([]);
    let [dataSourceKeys, setDataSourceKeys] = useState([]);
    let [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({});

    useEffect(() => {
        setPagination({ total: dataSource.total, showSizeChanger: true });
    }, [dataSource]);

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
            const response = await axios.post("/jum_agent/list", filters);

            if (response && response.data && response.data.data) {
                let agents = response.data.data;

                setDataSource(agents);
                setDataSourceKeys(lodash.map(agents, "id"));
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
        setLoading(false);
    };

    const forceStatusReload = async (agent) => {
        try {
            await axios.post(`/jum_agent/${agent.id}/forceReload`);
            await search();
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
    };

    useEffect(() => {
        search();
    }, []);

    const approveAgent = async (agent) => {
        try {
            await axios.put(`/jum_agent/${agent.id}/approve`);
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
    };

    const deleteAgent = async (agent) => {
        try {
            await axios.delete(`/jum_agent/${agent.id}`);
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
    };

    const showAgentLog = async (agent) => {
        const response = await axios.get(`/jum_agent/${agent.id}/log`);

        Modal.info({
            title: "Agent Log",
            width: "60vw",
            closable: true,
            centered: true,
            content: (
                <div>
                    <AceEditor
                        setOptions={{
                            useWorker: false,
                        }}
                        width="100%"
                        value={response.data.data}
                        name="chann.log"
                        theme="github"
                    />
                </div>
            ),
            onOk() {},
        });
    };

    const columns = [
        {
            title: T.translate("agents.columns.name"),
            dataIndex: "name",
            key: "name",
            ellipsis: true,
            sorter: true,
            render: (text, record) => {
                if (record.meta) {
                    return text;
                }
                return (
                    <div>
                        <b>{record.integration.name}</b> {"->"}{" "}
                        <Link
                            to={`/packages/${record.integration.package_code}/versions/${record.integration.package_version}/integrations/${record.integration.id}/${record.id}`}>
                            {text}
                        </Link>
                    </div>
                );
            },
        },

        {
            title: T.translate("agents.columns.status"),
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 100,
            render: (text, record) => {
                if (record.meta) {
                    //Status from main
                    return (
                        <div>
                            {text === "online" && <span title={text}>🟢</span>}
                            {text !== "online" && <span title={text}>🔴</span>}
                        </div>
                    );
                }
                return (
                    <div>
                        {record.status.status === "Started" && <span title={record.status.status}>🟢</span>}
                        {record.status.status !== "Started" && <span title={record.status.status}>🔴</span>}
                    </div>
                );
            },
        },
        {
            title: T.translate("agents.columns.approved"),
            dataIndex: "approved",
            key: "approved",
            align: "center",
            width: 100,
            render: (text, record) => {
                if (record.meta) {
                    return text ? (
                        <Icon path={mdiCheck} className={classes.icon} color={"green"} />
                    ) : (
                        <Icon path={mdiCancel} className={classes.icon} color={"red"} />
                    );
                }
            },
        },
        {
            title: T.translate("agents.columns.actions"),
            key: "action",
            width: 200,
            render: (text, record) => {
                if (record.meta) {
                    return (
                        <Space size="middle">
                            <Button
                                key="log"
                                type="text"
                                onClick={() => showAgentLog(record)}
                                icon={
                                    <Icon
                                        path={mdiTextLong}
                                        className={classes.icon}
                                        title={T.translate("common.button.log")}
                                    />
                                }
                            />
                            <Button
                                key="log"
                                type="text"
                                onClick={() => forceStatusReload(record)}
                                icon={
                                    <Icon
                                        path={mdiReload}
                                        className={classes.icon}
                                        title={T.translate("common.button.reload")}
                                    />
                                }
                            />
                            {!record.approved && (
                                <Popconfirm
                                    title={T.translate("common.question")}
                                    onConfirm={async () => {
                                        await approveAgent(record);
                                        await search();
                                    }}>
                                    <Button
                                        key="approve"
                                        type="text"
                                        icon={
                                            <Icon
                                                path={mdiCheckCircleOutline}
                                                className={classes.icon}
                                                color="green"
                                                title={T.translate("agents.actions.approve")}
                                            />
                                        }
                                    />
                                </Popconfirm>
                            )}
                            {record.approved && (
                                <Popconfirm
                                    title={T.translate("common.question")}
                                    onConfirm={async () => {
                                        await deleteAgent(record);
                                        await search();
                                    }}>
                                    <Button
                                        key="unapprove"
                                        type="text"
                                        icon={
                                            <Icon
                                                path={mdiTrashCan}
                                                className={classes.icon}
                                                color="red"
                                                title={T.translate("common.button.delete")}
                                            />
                                        }
                                    />
                                </Popconfirm>
                            )}
                        </Space>
                    );
                }
            },
        },
    ];

    return (
        <Content>
            <Row className={classes.card}></Row>
            <Table
                loading={loading}
                key="agents-table"
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

export default Agents;
