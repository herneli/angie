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
        try {
            const response = await axios.delete(`/integration/${record.id}`);

            if (response?.data?.success) {
                search();
                return notification.success({
                    message: T.translate("common.messages.deleted.title"),
                    description: T.translate("common.messages.deleted.description"),
                });
            }
        } catch (ex) {
            return notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
    };

    const search = async (filters = {}) => {
        try {
            const response = await axios.post("/integration/list/full", filters);

            if (response && response.data && response.data.data) {
                let integrations = response.data.data;
                setDataSourceKeys(lodash.map(integrations, "id"));

                setDataSource(integrations);
            }
        } catch (ex) {
            return notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
    };

    useEffect(() => {
        search();
    }, []);

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Estado",
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
            title: "Action",
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
            <Table
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
