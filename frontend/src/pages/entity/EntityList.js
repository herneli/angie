import { useEffect, useState } from "react";
import { Col, Input, Layout, notification, Row, Space, Table } from "antd";
import axios from "axios";
import moment from "moment";
import T from "i18n-react";
import { createUseStyles } from "react-jss";
import { mdiMagnifyPlus } from "@mdi/js";
import IconButton from "../../components/button/IconButton";
import EntityDetail from "./EntityDetail";
import { useHistory } from "react-router";

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

// const channelActions = new ChannelActions();

const EntityList = (props) => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});

    let history = useHistory();

    useEffect(() => {
        search();
    }, []);

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
            const response = await axios.post(`/entity/list`, filters);

            setPagination({ ...pagination, total: response?.data?.total });
            setDataSource(response?.data?.data);
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
        }
        setLoading(false);
    };

    const columns = [
        {
            title: T.translate("entity.id"),
            dataIndex: "_id",
            key: "_id",
            ellipsis: true,
            sorter: true,
        },
        {
            title: T.translate("entity.date"),
            dataIndex: "date",
            key: "date",
            defaultSortOrder: "descend",
            sorter: true,
            render: (text, record) => {
                const { date } = record._source;
                return moment(date).format("DD/MM/YYYY HH:mm:ss:SSS");
            },
        },
        {
            title: T.translate("entity.type"),
            dataIndex: "type",
            key: "type.keyword",
            sorter: true,
            render: (text, record) => {
                const { type } = record._source;
                return type;
            },
        },
        {
            title: T.translate("entity.actions"),
            key: "action",
            width: 50,
            fixed: "right",
            render: (text, record) => {
                return (
                    <Space size="middle">
                        <IconButton
                            type="text"
                            onClick={(e) => {
                                history.push({
                                    pathname: `/entity/${record._id}`,
                                });
                            }}
                            icon={{
                                path: mdiMagnifyPlus,
                                color: "#3d99f6",
                                size: 0.6,
                                title: T.translate("entity.detail"),
                            }}
                        />
                    </Space>
                );
            },
        },
    ];

    const onSearch = (value) => {
        if (value) {
            search(null, {
                "": {
                    type: "query_string",
                    value: value,
                },
            });
        } else {
            search();
        }
    };

    return (
        <Content>
            <Row className={classes.card}>
                <Col flex={1}>
                    <Input.Search className={classes.search} onSearch={(element) => onSearch(element)} enterButton />
                </Col>
                <Col flex={2}>
                    <Row justify="end" gutter={10}>
                        <Col>
                            {/* <Button
                                icon={<Icon path={mdiDownload} className={classes.icon} />}
                                type="text"
                                onClick={() => handleDownloadTable(dataSource)}
                            /> */}
                        </Col>
                    </Row>
                </Col>
            </Row>
            {dataSource && (
                <Table
                    loading={loading}
                    key="messages-table"
                    dataSource={dataSource}
                    columns={columns}
                    onChange={search}
                    pagination={pagination}
                    rowKey={"id"}
                    childrenColumnName={"channels"}
                    bordered
                    sort
                    scroll={{ x: 1100 }}
                    size="small"
                />
            )}
        </Content>
    );
};

export default EntityList;
