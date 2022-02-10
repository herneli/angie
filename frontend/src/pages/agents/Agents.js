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
} from "@mdi/js";
import Icon from "@mdi/react";

import { Link } from "react-router-dom";
import AgentOptions from "./AgentOptions";
import AgentLibraries from "./AgentLibraries";
import IconButton from "../../components/button/IconButton";
import Utils from "../../common/Utils";
import AceEditor from "../../components/ace-editor/AceEditor";
import BasicFilter from "../../components/basic-filter/BasicFilter";

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
    let [currentAgent, setCurrentAgent] = useState(null);

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

            if(ex?.response?.data?.message === 'agent_not_connected'){
                notification.error({
                    message: T.translate("common.messages.error.title"),
                    description: T.translate("common.messages.error.agent_not_connected", { error: ex }),
                });
            }else{
                notification.error({
                    message: T.translate("common.messages.error.title"),
                    description: T.translate("common.messages.error.description", { error: ex }),
                });
            }
            
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

    const reloadDependencies = async (agent) => {
        try {
            await axios.post(`/jum_agent/${agent.id}/reload_dependencies`);
            await search();
            notification.success({
                message: T.translate("common.messages.reloaded.title"),
                description: T.translate("common.messages.reloaded.ok_desc"),
            });
        } catch (ex) {
            if(ex?.response?.data?.message === 'agent_not_connected'){
                notification.error({
                    message: T.translate("common.messages.error.title"),
                    description: T.translate("common.messages.error.agent_not_connected", { error: ex }),
                });
            }else{
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
            width: 300,
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
                                        title={T.translate("agent.actions.view_libs")}
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
                                        title={T.translate("agent.actions.reload_libs")}
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
                                key="log"
                                type="text"
                                onClick={() => forceStatusReload(record)}
                                icon={
                                    <Icon
                                        path={mdiReload}
                                        className={classes.icon}
                                        title={T.translate("agent.actions.reload_status")}
                                    />
                                }
                            />
                            {!record.approved && (
                                <Popconfirm
                                    title={T.translate("common.question")}
                                    onConfirm={() => {
                                        (async () => {
                                            await approveAgent(record);
                                            await search();
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
                                            await search();
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

    const saveAgent = async ({ formData }) => {
        //TODo
        try {
            await axios.put(`/jum_agent/${formData.id}`, { id: formData.id, options: formData.options });
            await search();
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
            await search();
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }

        cancelLibraries();
    };

    const onSearch = (value) => {
        if (value.indexOf(":") !== -1) {
            return search(
                null,
                Utils.getFiltersByPairs((key) => `${key}::text`, value)
            );
        }
        if (!value) {
            return search();
        }
        search(null, {
            jum_agent: {
                type: "full-text-psql",
                value: value,
            },
        });
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
                    onClick={() => search()}
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
                onChange={search}
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
