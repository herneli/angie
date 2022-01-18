import React, { useEffect, useState } from "react";
import { Col, Row, Select, Space, Spin, Table, Layout, Button, message, notification } from "antd";
import T from "i18n-react";
import axios from "axios";
import { Link } from "react-router-dom";

const { Content } = Layout;

export default function Packages({ history }) {
    const [packages, setPackages] = useState();
    useEffect(() => {
        axios.get("/packages").then((response) => {
            setPackages(response.data.data.map((item) => ({ ...item, key: item.id })));
        });
    }, []);

    const handleOnPublish = (code, version) => () => {
        axios
            .get("/packages/" + code + "/versions/" + version + "/update_remote")
            .then((response) => {
                message.info(T.translate("packages.published_successfully"));
            })
            .catch((error) => {
                notification.error({ message: "Error puglishing" });
            });
    };

    if (!packages) {
        return <Spin></Spin>;
    }

    const renderExpandable = (packageData) => {
        let extendedColumns = [
            { title: "Version", key: "version", dataIndex: "version" },
            { title: "Local commit", key: "local_commit", dataIndex: "local_commit" },
            { title: "Remote commit", key: "remote_commit", dataIndex: "remote_commit" },
            {
                title: "Acciones",
                key: "actions",
                render: (text, record) => {
                    return (
                        <Space>
                            <Link to={"packages/" + record.code + "/versions/" + record.version}>
                                {T.translate("packages.configure")}
                            </Link>
                            <Button type="link" onClick={handleOnPublish(record.code, record.version)}>
                                {T.translate("packages.publish")}
                            </Button>
                        </Space>
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
                    />
                </Col>
            </Row>
        );
    };

    const columns = [
        {
            title: "Id",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Nombre",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Código",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "Version",
            dataIndex: "version",
            key: "version",
        },
    ];

    return (
        <Layout>
            <Content>
                <Row>
                    <Col span={24}>
                        <Table
                            dataSource={packages}
                            columns={columns}
                            size="small"
                            bordered
                            expandable={{
                                expandedRowRender: renderExpandable,
                                rowExpandable: (record) => true,
                            }}></Table>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}
