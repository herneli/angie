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
                return <Link to={"packages/" + record.id}>{T.translate("packages.configure")}</Link>;
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
                                expandedRowRender: (packageData) => <p>{packageData.dependencies}</p>,
                                rowExpandable: (record) => true,
                            }}></Table>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}
