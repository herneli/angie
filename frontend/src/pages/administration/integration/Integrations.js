import { useEffect, useState } from "react";
import { Button, Col, Input, message, notification, Popconfirm, Row, Space, Table } from "antd";
import axios from "axios";
import moment from "moment";
import lodash from "lodash";

import T from "i18n-react";

import { useHistory } from "react-router";
import { v4 as uuid_v4 } from "uuid";
import Icon from "@mdi/react";
import { mdiCancel, mdiCheck, mdiContentCopy, mdiDelete, mdiDownload, mdiPencil, mdiPlus, mdiUpload } from "@mdi/js";
import { createUseStyles } from "react-jss";
import { usePackage } from "../../../components/packages/PackageContext";
import Utils from "../../../common/Utils";
import { Link } from "react-router-dom";

import * as api from "../../../api/configurationApi";

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

const Integrations = () => {
    let [dataSource, setDataSource] = useState([]);
    let [dataSourceKeys, setDataSourceKeys] = useState([]);
    let [loading, setLoading] = useState(false);
    let packageData = usePackage();

    const [pagination, setPagination] = useState({});
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
        setPagination({ total: dataSource.total, showSizeChanger: true });
    }, [dataSource]);

    let history = useHistory();

    const classes = useStyles();

    const startEdit = (record) => {
        history.push({
            pathname: "integrations/" + record.id,
        });
    };

    const onElementDelete = async (record) => {
        setLoading(true);
        try {
            await axios.delete(`/integration/${record.id}`);

            setTimeout(search, 200);
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
        setLoading(false);
    };
    /**
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadOrganizations = async () => {
        try {
            const organizations = await api.getModelDataList("organization");
            setOrganizations(organizations);
        } catch (ex) {
            console.error(ex);
        }
    };

    const search = async (pagination, filters = {}, sorts) => {
        await loadOrganizations();
        setLoading(true);

        if (pagination?.pageSize && pagination?.current) {
            filters.limit = pagination.pageSize ? pagination.pageSize : 10;
            filters.start =
                (pagination.current ? pagination.current - 1 : 0) * (pagination.pageSize ? pagination.pageSize : 10);
        }
        if (packageData) {
            filters[["package_code", "package_version"]] = {
                type: "in",
                value: [[packageData.currentPackage.code, packageData.currentPackage.version]],
            };
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
                const promises = importItems.map((item) =>
                    saveIntegration({
                        ...item,
                        package_code: packageData.currentPackage.code,
                        package_version: packageData.currentPackage.version,
                        // id: null,
                    })
                );
                Promise.all(promises).then((values) => {
                    message.success(T.translate("configuration.end_of_loading_json_file"));
                    search();
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
                    onConfirm={(e) => {
                        handleOnDuplicateModel(e, record);
                    }}>
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
                    onClick={(e) => {
                        handleOnDownloadModel(e, record);
                    }}
                />
                <Popconfirm
                    title={T.translate("common.question")}
                    onConfirm={() => {
                        onElementDelete(record);
                    }}>
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
            sorter: true,
            render: (text, record) => {
                if (record.channels)
                    return (
                        <Link to={`integrations/${record.id}`}>
                            <b>{record.name}</b>
                        </Link>
                    );

                let int = lodash.find(dataSource, (int) => {
                    let chann = lodash.find(int.channels, { id: record.id });
                    if (chann != null) {
                        return int;
                    }
                });
                return <Link to={`integrations/${int.id}/${record.id}`}>{text}</Link>;
            },
        },
        // {
        //     title: T.translate("integrations.columns.description"),
        //     dataIndex: "description",
        //     key: "integration.data->>'description'",
        //     ellipsis: true,
        //     sorter: true,
        //     render: (text, record) => {
        //         if (record.channels) return <b>{text}</b>;

        //         return text;
        //     },
        // },
        {
            title: T.translate("integrations.columns.organization"),
            dataIndex: "deployment_config.organization_id",
            key: "organization",
            render: (text, record) => {
                if (!record.channels) return;
                if (!record?.deployment_config?.organization_id) {
                    return "-";
                }
                const org = lodash.find(organizations, { id: record.deployment_config.organization_id });
                return org.name;
            },
        },
        {
            title: T.translate("integrations.columns.status"),
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 60,
            render: (text, record) => {
                if (!record.channels)
                    return (
                        <div>
                            {!record.enabled && (
                                <Icon path={mdiCancel} size={0.6} color="red" title={T.translate("common.disabled")} />
                            )}
                            {record?.enabled && (
                                <Icon path={mdiCheck} size={0.6} color="green" title={T.translate("common.enabled")} />
                            )}
                        </div>
                    );
                return (
                    <div>
                        {!record?.deployment_config?.enabled && (
                            <Icon path={mdiCancel} size={0.6} color="red" title={T.translate("common.disabled")} />
                        )}
                        {record?.deployment_config?.enabled && (
                            <Icon path={mdiCheck} size={0.6} color="green" title={T.translate("common.enabled")} />
                        )}
                        {/* {record.enabled && text === "Started" && <span title={text}>🟢</span>}
                        {record.enabled && text === "UNDEPLOYED" && <span title={text}>🔴</span>}
                        {record.enabled && text === "Stopped" && <span title={text}>🟠</span>} */}
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
                if (!record.channels) return;

                if (record.channels) {
                    return drawIntegrationActionButtons(record);
                }
            },
        },
    ];

    const addIntegration = () => {
        history.push({
            pathname: "integrations/new",
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

    const onSearch = (value) => {
        if (value.indexOf(":") !== -1) {
            return search(
                null,
                Utils.getFiltersByPairs((key) => `data->>'${key}'`, value)
            );
        }
        search(null, {
            "integration.data::text": {
                type: "jsonb",
                value: value,
            },
        });
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
                onChange={search}
                pagination={pagination}
                rowKey={"id"}
                childrenColumnName={"channels"}
                bordered
                sort
                size="small"
                expandable={{ expandedRowKeys: dataSourceKeys }}
            />
        </div>
    );
};

export default Integrations;
