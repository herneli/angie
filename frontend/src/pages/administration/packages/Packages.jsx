import React, { useEffect, useState } from "react";
import { Col, Row, Select, Space, Spin, Table, Layout } from "antd";
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

    if (!packages) {
        return <Spin></Spin>;
    }

    const renderExpandable = (packageData) => {
        let dataSource = (packageData.dependencies || []).map((dependecy) => ({
            code: dependecy[0],
            version: dependecy[1],
        }));
        return (
            <Row style={{ margin: "10px" }}>
                <Col span={12}>
                    <Table
                        bordered
                        size="small"
                        columns={[
                            ,
                            { title: "Pakcage", key: "code", dataIndex: "code" },
                            { title: "Version", key: "version", dataIndex: "version" },
                        ]}
                        dataSource={dataSource}
                        title={() => T.translate("packages.dependencies")}
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
        {
            title: "Acciones",
            key: "actions",
            render: (text, record) => {
                return (
                    <Link to={`/packages/${record.code}@${record.version}`}>{T.translate("packages.configure")}</Link>
                );
            },
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
