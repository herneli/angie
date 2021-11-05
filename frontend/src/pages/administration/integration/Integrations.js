import { useEffect, useState } from "react";
import { Button, notification, Popconfirm, Space, Table } from "antd";
import axios from "axios";
import moment from "moment";
import lodash from "lodash";

import T from "i18n-react";

import { useHistory } from "react-router";
import { v4 as uuid_v4 } from "uuid";

const Integrations = () => {
    let [dataSource, setDataSource] = useState([]);
    let [dataSourceKeys, setDataSourceKeys] = useState([]);
    let [loading, setLoading] = useState(false);
    let history = useHistory();

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
                notification.success({
                    message: T.translate("common.messages.deleted.title"),
                    description: T.translate("common.messages.deleted.description"),
                });
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
        setLoading(false);
    };

    const search = async (filters = {}) => {
        setLoading(true);
        try {
            const response = await axios.post("/integration/list/full", filters);

            if (response && response.data && response.data.data) {
                let integrations = response.data.data;
                setDataSourceKeys(lodash.map(integrations, "id"));

                setDataSource(integrations);
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

    const columns = [
        {
            title: T.translate("integrations.columns.name"),
            dataIndex: "name",
            key: "name",
        },
        {
            title: T.translate("integrations.columns.description"),
            dataIndex: "description",
            key: "description",
        },
        {
            title: T.translate("integrations.columns.status"),
            dataIndex: "status",
            key: "status",
            render: (text, record) => {
                if (record.channels) return;
                return (
                    <div>
                        {!record.enabled && <span>DISABLED</span>}
                        {record.enabled && <span>{text}</span>}
                    </div>
                );
            },
        },
        {
            title: T.translate("integrations.columns.message_count"),
            dataIndex: "message_count",
            key: "message_count",
            render: (text, record) => {
                if (record.channels) return;
                return text;
            },
        },
        {
            title: T.translate("integrations.columns.actions"),
            key: "action",
            width: 120,
            render: (text, record) => {
                if (!record.channels) return;
                return (
                    <Space size="middle">
                        <Button type="link" onClick={() => startEdit(record)}>
                            {T.translate("common.button.edit")}
                        </Button>
                        <Popconfirm title={T.translate("common.question")} onConfirm={() => onElementDelete(record)}>
                            <Button type="link">{T.translate("common.button.delete")}</Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    const addIntegration = () => {
        let generatedId = uuid_v4();
        history.push({
            pathname: "/admin/integration/" + generatedId,
            state: {
                new: true,
                record: {
                    id: generatedId,
                    name: "",
                    description: "",
                    created_on: moment().toISOString(),
                    channels: [],
                },
            },
        });
    };

    return (
        <div>
            <Button type="primary" onClick={addIntegration}>
                {T.translate("common.button.add")}
            </Button>
            <Button style={{ float: "right" }} type="primary" onClick={() => search()}>
                {T.translate("common.button.search")}
            </Button>
            <Table
                loading={loading}
                key="integrations-table"
                dataSource={dataSource}
                columns={columns}
                rowKey={"id"}
                childrenColumnName={"channels"}
                expandable={{ expandedRowKeys: dataSourceKeys }}
            />
        </div>
    );
};

export default Integrations;
