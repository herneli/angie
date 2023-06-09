import { useEffect, useState } from "react";
import { notification, Row, Table, Layout, Space, Popconfirm, Button, Modal, Col, Input } from "antd";
import axios from "axios";
import lodash from "lodash";

import T from "i18n-react";

import { createUseStyles } from "react-jss";
import {
    mdiCancel,
    mdiCheck,
    mdiCheckCircleOutline,
    mdiCogs,
    mdiRefresh,
    mdiReload,
    mdiTextLong,
    mdiTrashCan,
    mdiCastAudioVariant,
    mdiLibrary,
    mdiCertificate,
    mdiMonitorEye,
    mdiChartBar,
} from "@mdi/js";
import Icon from "@mdi/react";

import { Link, useHistory } from "react-router-dom";
import AgentOptions from "./AgentOptions";
import AgentLibraries from "./AgentLibraries";
import IconButton from "../../components/button/IconButton";
import Utils from "../../common/Utils";
import AceEditor from "../../components/ace-editor/AceEditor";
import BasicFilter from "../../components/basic-filter/BasicFilter";
import AgentCertificates from "./AgentCertificates";

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
    let [optionsVisible, setOptionsVisible] = useState(false);
    let [librariesVisible, setLibrariesVisible] = useState(false);
    let [agentDependenciesVisible, setAgentDependenciesVisible] = useState(false);
    let [agentCertificatesVisible, setAgentCertificatesVisible] = useState(false);
    let [currentAgent, setCurrentAgent] = useState(null);

    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({ showSizeChanger: true });
    const [sort, setSort] = useState({});

    const classes = useStyles();
    const history = useHistory();
    const search = async (pagination, filters = {}, sorts) => {
        setLoading(true);

        filters.limit = pagination?.pageSize || 10;
        filters.start = (pagination?.current - 1 || 0) * (pagination?.pageSize || 10);

        filters.sort = sorts &&
            Object.keys(sorts).length !== 0 && {
                field: sorts.columnKey || sorts.field,
                direction: sorts.order,
            };

        try {
            const response = await axios.post("/jum_agent/list", filters);

            if (response && response.data && response.data.data) {
                let agents = response.data.data;

                setPagination({ ...pagination, total: response?.data?.total });
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

    const showStats = (agent) => {
        history.push({
            pathname: `/monitoring/jum_servers/${agent.name}`,
        });
    };

    const forceStatusReload = async (agent) => {
        try {
            await axios.post(`/jum_agent/${agent.id}/forceReload`);
            await search(pagination, filters, sort);
        } catch (ex) {
            if (ex?.response?.data?.message === "agent_not_connected") {
                notification.error({
                    message: T.translate("common.messages.error.title"),
                    description: T.translate("common.messages.error.agent_not_connected", { error: ex }),
                });
            } else {
                notification.error({
                    message: T.translate("common.messages.error.title"),
                    description: T.translate("common.messages.error.description", { error: ex }),
                });
            }
        }
    };

    useEffect(() => {
        search(pagination, filters, sort);
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

    const reloadDependencies = async (agent) => {
        try {
            await axios.post(`/jum_agent/${agent.id}/reload_dependencies`);
            await search(pagination, filters, sort);
            notification.success({
                message: T.translate("common.messages.reloaded.title"),
                description: T.translate("common.messages.reloaded.ok_desc"),
            });
        } catch (ex) {
            if (ex?.response?.data?.message === "agent_not_connected") {
                notification.error({
                    message: T.translate("common.messages.error.title"),
                    description: T.translate("common.messages.error.agent_not_connected", { error: ex }),
                });
            } else {
                notification.error({
                    message: T.translate("common.messages.error.title"),
                    description: T.translate("common.messages.error.description", { error: ex }),
                });
            }
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
                            {text === "offline" && <span title={text}>🔴</span>}
                            {text === "installing" && <span title={text}>🟡</span>}
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
            width: 380,
            render: (text, record) => {
                if (record.meta) {
                    return (
                        <Space size="middle">
                            <Button
                                key="options"
                                type="text"
                                onClick={() => {
                                    setCurrentAgent(record);
                                    setOptionsVisible(true);
                                }}
                                icon={
                                    <Icon
                                        path={mdiCogs}
                                        className={classes.icon}
                                        title={T.translate("agents.actions.configure")}
                                    />
                                }
                            />
                            <Button
                                key="options"
                                type="text"
                                onClick={() => {
                                    setCurrentAgent(record);
                                    setAgentDependenciesVisible(true);
                                }}
                                icon={
                                    <Icon
                                        path={mdiLibrary}
                                        className={classes.icon}
                                        title={T.translate("agents.actions.view_libs")}
                                    />
                                }
                            />
                            <Button
                                key="options"
                                type="text"
                                onClick={() => {
                                    reloadDependencies(record);
                                }}
                                icon={
                                    <Icon
                                        path={mdiCastAudioVariant}
                                        className={classes.icon}
                                        title={T.translate("agents.actions.reload_libs")}
                                    />
                                }
                            />
                            <Button
                                key="options"
                                type="text"
                                onClick={() => {
                                    showAgentCertificates(record);
                                }}
                                icon={
                                    <Icon
                                        path={mdiCertificate}
                                        className={classes.icon}
                                        title={T.translate("agents.actions.configure_certificates")}
                                    />
                                }
                            />
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
                                key="stats"
                                type="text"
                                onClick={() => showStats(record)}
                                disabled={record.status === "offline"}
                                icon={
                                    <Icon
                                        path={mdiMonitorEye}
                                        className={classes.icon}
                                        title={T.translate("menu.monitoring.title")}
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
                                        title={T.translate("agents.actions.reload_status")}
                                    />
                                }
                            />
                            {!record.approved && (
                                <Popconfirm
                                    title={T.translate("common.question")}
                                    onConfirm={() => {
                                        (async () => {
                                            await approveAgent(record);
                                            await search(pagination, filters, sort);
                                        })();
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
                                    onConfirm={() => {
                                        (async () => {
                                            await deleteAgent(record);
                                            await search(pagination, filters, sort);
                                        })();
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

    const cancelOptions = () => {
        setOptionsVisible(false);
        setCurrentAgent(null);
    };

    const cancelLibraries = () => {
        setLibrariesVisible(false);
        setAgentDependenciesVisible(false);
    };

    const showAgentCertificates = (agent) => {
        setCurrentAgent(agent);
        setAgentCertificatesVisible(true);
    };

    const hideAgentCertificates = () => {
        setAgentCertificatesVisible(false);
        setCurrentAgent(null);
    }

    const saveAgent = async ({ formData }) => {
        //TODo
        try {
            await axios.put(`/jum_agent/${formData.id}`, { id: formData.id, options: formData.options });
            await search(pagination, filters, sort);
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }

        cancelOptions();
    };

    const saveLibraries = async ({ formData }) => {
        try {
            await axios.post(`/library/updateAll`, { libraries: formData.libraries });
            await search(pagination, filters, sort);
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }

        cancelLibraries();
    };

    const saveCertificates = async ({ formData }) => {
        try {
            await axios.post(`/jum_agent/${formData.id}/update_certificates`, { certificate_ids: formData.certificate_ids });
            await search(pagination, filters, sort);
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }

        hideAgentCertificates();
    }

    const onSearch = ({ filter }) => {
        let newFilters = {};
        if (filter && filter.indexOf(":") !== -1) {
            newFilters = Utils.getFiltersByPairs((key) => `${key}::text`, filter);
        } else if (filter) {
            newFilters["jum_agent"] = {
                type: "full-text-psql",
                value: filter,
            };
        }
        setFilters(newFilters);
        search(pagination, newFilters, sort);
    };
    return (
        <Content>
            <BasicFilter hideDateFilter onSearch={onSearch}>
                <IconButton
                    key="dependencies"
                    onClick={() => setLibrariesVisible(true)}
                    icon={{
                        path: mdiLibrary, //mdi-folder-move, mdi-folder-plus, mdi-folder-upload, mdi-library-plus, mdi-library, mdi-basket-fill
                        size: 0.7,
                    }}
                    title={T.translate("common.button.libraries")}
                />
                <IconButton
                    key="undeploy"
                    onClick={() => search(pagination, filters, sort)}
                    icon={{
                        path: mdiRefresh,
                        size: 0.7,
                    }}
                    title={T.translate("common.button.refresh")}
                />
            </BasicFilter>
            <br />
            <Table
                loading={loading}
                key="agents-table"
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
                size="small"
                expandable={{ expandedRowKeys: dataSourceKeys }}
            />
            {agentDependenciesVisible && (
                <AgentLibraries
                    agent={currentAgent}
                    visible={agentDependenciesVisible}
                    onOk={saveLibraries}
                    onCancel={cancelLibraries}
                />
            )}
            {agentCertificatesVisible && (
                <AgentCertificates
                    agent={currentAgent}
                    visible={agentCertificatesVisible}
                    onOk={saveCertificates}
                    onCancel={hideAgentCertificates}
                />
            )}
            {optionsVisible && (
                <AgentOptions agent={currentAgent} visible={optionsVisible} onOk={saveAgent} onCancel={cancelOptions} />
            )}
            {librariesVisible && (
                <AgentLibraries visible={librariesVisible} onOk={saveLibraries} onCancel={cancelLibraries} />
            )}
        </Content>
    );
};

export default Agents;
