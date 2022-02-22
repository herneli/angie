import React, { useEffect, useState } from "react";
import { Col, Row, Select, Space, Spin, Table, Layout, Button, message, notification, Input, Popconfirm } from "antd";
import T from "i18n-react";
import axios from "axios";
import { Link } from "react-router-dom";
import Icon from "@mdi/react";
import {
    mdiApplicationCogOutline,
    mdiCloudDownload,
    mdiCloudUpload,
    mdiContentCopy,
    mdiDelete,
    mdiGraph,
    mdiPlus,
    mdiRefresh,
} from "@mdi/js";
import { createUseStyles } from "react-jss";

import PackageNew from "./PackageNew";
import PackageVersionNew from "./PackageVersionNew";
import PackageVersionDependencies from "./PackageVersionDependencies";

const { Search } = Input;
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

export default function Packages({ history }) {
    const classes = useStyles();
    const [packages, setPackages] = useState();
    const [dialogActive, setDialogActive] = useState();
    const loadPackages = () => {
        axios.get("/packages").then((response) => {
            setPackages(response.data.data.map((item) => ({ ...item, key: item.id })));
        });
    };
    useEffect(() => {
        loadPackages();
    }, []);

    const handleOnPublish = (code, version) => () => {
        axios
            .get("/packages/" + code + "/versions/" + version + "/publish")
            .then((response) => {
                message.info(T.translate("packages.publish_successful"));
                loadPackages();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.publish_error") });
            });
    };

    const handleOnCopy = (packageVersion) => () => {
        setDialogActive({ code: "copyVersion", payload: packageVersion });
    };
    const handleOnDeps = (packageVersion) => () => {
        setDialogActive({ code: "versionDeps", payload: packageVersion });
    };

    const handleOnImport = (code, version) => () => {
        axios
            .get("/packages/" + code + "/versions/" + version + "/import")
            .then((response) => {
                message.info(T.translate("packages.import_successful"));
                loadPackages();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.import_error") });
            });
    };
    const handleOnRefreshStatus = (code) => () => {
        axios
            .get("/packages/" + code + "/check_remote_status")
            .then((response) => {
                message.info(T.translate("packages.remote_status_updated"));
                loadPackages();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.remote_status_error") });
            });
    };

    const handleOnAddPackage = () => {
        setDialogActive({ code: "newPackage", payload: null });
    };

    const handleOnDeletePackage = (code) => () => {
        axios
            .delete("/packages/" + code)
            .then((response) => {
                message.info(T.translate("packages.delete_successful"));
                loadPackages();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.delete_error") });
            });
    };

    const handleOnDeletePackageVersion = (code, version) => () => {
        axios
            .delete("/packages/" + code + "/versions/" + version)
            .then((response) => {
                message.info(T.translate("packages.delete_successful"));
                loadPackages();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.delete_error") });
            });
    };

    const renderExpandable = (packageData) => {
        let extendedColumns = [
            {
                title: T.translate("packages.version"),
                key: "version",
                dataIndex: "version",
                render: (text, record) => (
                    <Link to={"packages/" + record.code + "/versions/" + record.version}>{text}</Link>
                ),
            },
            { title: T.translate("packages.local_commit"), key: "local_commit", dataIndex: "local_commit" },
            { title: T.translate("packages.remote_commit"), key: "remote_commit", dataIndex: "remote_commit" },
            {
                title: "Acciones",
                key: "actions",
                render: (text, record) => {
                    return (
                        <>
                            {!packageData.remote || record.local_commit ? (
                                <Button
                                    type="text"
                                    onClick={() =>
                                        history.push("packages/" + record.code + "/versions/" + record.version)
                                    }
                                    icon={
                                        <Icon
                                            path={mdiApplicationCogOutline}
                                            title={T.translate("packages.configure")}
                                            className={classes.icon}
                                        />
                                    }></Button>
                            ) : null}
                            {packageData.remote &&
                            record.remote_commit &&
                            record.remote_commit !== record.local_commit ? (
                                <Button
                                    type="text"
                                    onClick={handleOnImport(record.code, record.version)}
                                    icon={
                                        <Icon
                                            path={mdiCloudDownload}
                                            title={T.translate("packages.import")}
                                            className={classes.icon}
                                        />
                                    }></Button>
                            ) : null}
                            {packageData.remote &&
                            record.local_commit &&
                            record.remote_commit === record.local_commit ? (
                                <Button
                                    type="text"
                                    onClick={handleOnPublish(record.code, record.version)}
                                    icon={
                                        <Icon
                                            path={mdiCloudUpload}
                                            title={T.translate("packages.publish")}
                                            className={classes.icon}
                                        />
                                    }></Button>
                            ) : null}
                            {!packageData.remote || (record.remote_commit && record.remote_commit !== "initial") ? (
                                <Button
                                    type="text"
                                    onClick={handleOnCopy(record)}
                                    icon={
                                        <Icon
                                            path={mdiContentCopy}
                                            title={T.translate("packages.copy_version")}
                                            className={classes.icon}
                                        />
                                    }></Button>
                            ) : null}

                            <Button
                                type="text"
                                onClick={handleOnDeps(record)}
                                icon={
                                    <Icon
                                        path={mdiGraph}
                                        title={T.translate("packages.dependencies")}
                                        className={classes.icon}
                                    />
                                }
                            />
                            <Popconfirm
                                title={T.translate("packages.delete_package_version_confirmation")}
                                onConfirm={handleOnDeletePackageVersion(record.code, record.version)}>
                                <Button
                                    type="text"
                                    icon={
                                        <Icon
                                            path={mdiDelete}
                                            title={T.translate("packages.delete_package")}
                                            className={classes.icon}
                                        />
                                    }></Button>
                            </Popconfirm>
                        </>
                    );
                },
            },
        ];
        return (
            <Row style={{ margin: "10px" }}>
                <Col span={12}>
                    <Table
                        bordered
                        size="small"
                        columns={extendedColumns}
                        dataSource={packageData.versions}
                        pagination={false}
                        rowKey="version"
                    />
                </Col>
            </Row>
        );
    };

    const handleOnDialogCancel = () => {
        setDialogActive(null);
    };

    const handleOnDialogComplete = () => {
        setDialogActive(null);
        loadPackages();
    };

    const renderDialog = (dialog) => {
        switch (dialog.code) {
            case "newPackage":
                return <PackageNew onCancel={handleOnDialogCancel} onCreate={handleOnDialogComplete} />;
            case "copyVersion":
                return (
                    <PackageVersionNew
                        baseVersion={dialog.payload}
                        onCancel={handleOnDialogCancel}
                        onOk={handleOnDialogComplete}
                    />
                );
            case "versionDeps":
                return (
                    <PackageVersionDependencies
                        baseVersion={dialog.payload}
                        onCancel={handleOnDialogCancel}
                        onOk={handleOnDialogComplete}
                    />
                );
            default:
                return null;
        }
    };

    const columns = [
        {
            title: T.translate("packages.id"),
            dataIndex: "id",
            key: "id",
        },
        {
            title: T.translate("packages.name"),
            dataIndex: "name",
            key: "name",
        },
        {
            title: T.translate("packages.code"),
            dataIndex: "code",
            key: "code",
        },
        {
            title: T.translate("packages.remote"),
            dataIndex: "remote",
            key: "remote",
        },
        {
            title: T.translate("packages.actions"),
            key: "actions",
            render: (key, record) => {
                return (
                    <>
                        {record.remote ? (
                            <Button
                                type="text"
                                onClick={handleOnRefreshStatus(record.code)}
                                icon={
                                    <Icon
                                        path={mdiRefresh}
                                        title={T.translate("packages.refresh_status")}
                                        className={classes.icon}
                                    />
                                }></Button>
                        ) : null}
                        <Popconfirm
                            title={T.translate("packages.delete_package_confirmation")}
                            onConfirm={handleOnDeletePackage(record.code)}>
                            <Button
                                type="text"
                                icon={
                                    <Icon
                                        path={mdiDelete}
                                        title={T.translate("packages.delete_package")}
                                        className={classes.icon}
                                    />
                                }></Button>
                        </Popconfirm>
                    </>
                );
            },
        },
    ];

    if (!packages) {
        return <Spin></Spin>;
    }

    return (
        <>
            <Content>
                <Row className={classes.card}>
                    <Col flex={4}>
                        <Search className={classes.search} enterButton />
                    </Col>
                    <Col flex={2}>
                        <Row justify="end">
                            <Col>
                                <Button
                                    icon={<Icon path={mdiPlus} className={classes.icon} />}
                                    type="text"
                                    onClick={handleOnAddPackage}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Table
                    style={{ margin: 10 }}
                    dataSource={packages}
                    columns={columns}
                    size="small"
                    bordered
                    expandable={{
                        expandedRowRender: renderExpandable,
                        rowExpandable: (record) => true,
                    }}></Table>
            </Content>
            {dialogActive ? renderDialog(dialogActive) : null}
        </>
    );
}
