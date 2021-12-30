import React, { useEffect, useState } from "react";
import { Col, Input, List, notification, Popconfirm, Row, Space, Layout, Avatar, Tag, Badge } from "antd";
import axios from "axios";
import moment from "moment";
import lodash from "lodash";

import T from "i18n-react";

import Icon from "@mdi/react";
import { mdiCancel, mdiPlayCircle, mdiSourceBranchPlus, mdiStopCircle, mdiTextLong } from "@mdi/js";
import { createUseStyles } from "react-jss";
import ChannelActions from "../administration/integration/ChannelActions";
import { Link } from "react-router-dom";
import EllipsisParagraph from "../../components/text/EllipsisParagraph";
import IconButton from "../../components/button/IconButton";
import Utils from "../../common/Utils";

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
        width: 16,
        height: 16,
    },
    sublist: {
        marginLeft: 12,
    },
    integrationTags: {
        float: "right",
    },
    channelActions: {
        marginTop: 14,
        paddingLeft: 30,
        textAlign: "right",
        width: 300,
        borderLeft: "1px solid #f0f0f0",
    },
    channelName: {
        width: 160,
    },
});

const channelActions = new ChannelActions();

const DeployedIntegrations = ({ packageUrl }) => {
    let [dataSource, setDataSource] = useState([]);
    let [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState([]);

    const [pagination, setPagination] = useState({});

    const classes = useStyles();

    const initialize = async () => {
        await loadOrganizations();
        await search();
    };
    /**
     * Carga los datos iniciales
     */
    useEffect(() => {
        initialize();
    }, []);

    /**
     * Establece los parametros basicos de paginacion
     */
    useEffect(() => {
        const pagination = {
            total: dataSource.total,
            showSizeChanger: true,
            pageSize: 10,
        };
        setPagination({
            ...pagination,
            onChange: (page) => {
                search({ ...pagination, current: page });
            },
        });
    }, [dataSource]);

    /**
     * Realiza la busqueda teniendo en cuenta la paginacion y los filtros
     *
     * @param {*} pagination
     * @param {*} filters
     * @param {*} sorts
     */
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
            const response = await axios.post("/integration/list", filters);

            if (response && response.data && response.data.data) {
                let integrations = response.data.data;
                setDataSource({
                    data: lodash.map(integrations, (el) => {
                        el.data.package_code = el.package_code;
                        el.data.package_version = el.package_version;
                        return el.data;
                    }),
                    total: response.data.total,
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

    /**
     * Crea los botones de acción sobre un canal
     *
     * @param {*} integration
     * @param {*} record
     * @returns
     */
    const drawChannelActionButtons = (integration, record) => {
        return (
            <Space size="middle">
                {integration?.deployment_config?.enabled && record.enabled && record.status === "Started" && (
                    <Popconfirm
                        title={T.translate("common.question")}
                        onConfirm={async () => {
                            await channelActions.undeployChannel(integration.id, record.id, false);
                            await search();
                        }}>
                        <IconButton
                            key="undeploy"
                            icon={{
                                path: mdiStopCircle,
                                className: classes.icon,
                                color: "red",
                            }}
                            title={T.translate("integrations.channel.button.undeploy")}
                        />
                    </Popconfirm>
                )}
                {integration?.deployment_config?.enabled && record.enabled && record.status !== "Started" && (
                    <span>
                        <IconButton
                            key="deploy"
                            onClick={async () => {
                                await channelActions.deployChannel(integration.id, record.id);
                                await search();
                            }}
                            icon={{
                                path: mdiPlayCircle,
                                color: "green",
                                className: classes.icon,
                            }}
                            title={T.translate("integrations.channel.button.deploy")}
                        />
                    </span>
                )}

                <IconButton
                    key="log"
                    onClick={() => channelActions.showChannelLog(integration.id, record.id)}
                    icon={{ path: mdiTextLong, size: 0.6, title: T.translate("common.button.log") }}
                />
            </Space>
        );
    };

    /**
     * Crea los tags de estado de una integracion
     * @param {*} record
     * @returns
     */
    const drawIntegrationStatus = (record) => {
        if (record?.deployment_config?.enabled) {
            return <Tag color="green">{T.translate("common.enabled")}</Tag>;
        }
        return <Tag color="red">{T.translate("common.disabled")}</Tag>;
    };

    /**
     * Crea los iconos de estado de un canal
     *
     * @param {*} record
     * @returns
     */
    const drawChannelStatus = (record) => {
        return (
            <div>
                {!record.enabled && (
                    <Icon path={mdiCancel} size={0.6} color="red" title={T.translate("common.disabled")} />
                )}
                {record.enabled && record.status === "Started" && <span title={record.status}>🟢</span>}
                {record.enabled && record.status === "UNDEPLOYED" && <span title={record.status}>🔴</span>}
                {record.enabled && record.status === "Stopped" && <span title={record.status}>🟠</span>}
            </div>
        );
    };

    const onSearch = (value) => {
        if (value.indexOf(":") !== -1) {
            return search(null, Utils.getFiltersByPairs(value));
        }
        search(null, {
            "integration.data::text": {
                type: "jsonb",
                value: value,
            },
        });
    };

    /**
     * Carga los tipos de nodos para su utilización a lo largo de las integraciones y canales
     */
    const loadOrganizations = async () => {
        const response = await axios.get("/configuration/model/organization/data");

        if (response?.data?.success) {
            setOrganizations(response?.data?.data);
        } else {
            console.error(response.data);
        }
    };

    /**
     * Obtiene una organización en base a su id
     * @param {*} id
     * @returns
     */
    const getOrganizationById = (id) => {
        if (!id) return null;
        const org = lodash.find(organizations, { id: id });
        if (!org) return null;
        return { ...org, ...org.data };
    };

    /**
     * Crea el tag de organizacion de una integración
     *
     * @param {*} item
     * @returns
     */
    const renderOrganization = (item) => {
        const org = getOrganizationById(item?.deployment_config?.organization_id);
        return T.translate("integrations.integration_form_subtitle", {
            name: org?.name || "-",
        });
    };

    /**
     * Metodo encargado de pintar una integración y sus canales
     *
     * @param {*} item
     * @returns
     */
    const drawIntegration = (item) => {
        return (
            <List.Item key={item.id}>
                <Space className={classes.integrationTags}>
                    <Tag color={"blue"}>
                        {item.package_code}@{item.package_version}
                    </Tag>
                    <Tag>{renderOrganization(item)}</Tag>
                    {drawIntegrationStatus(item)}
                </Space>

                <List.Item.Meta
                    avatar={<Avatar icon={<Icon path={mdiSourceBranchPlus} size={0.7} />} />}
                    title={
                        <Link to={`/packages/${item.package_code}@${item.package_version}/integrations/${item.id}`}>
                            {item.name}
                        </Link>
                    }
                    description={<EllipsisParagraph text={item.description} maxChars={100} />}
                />

                <List
                    className={classes.sublist + " channelList"}
                    itemLayout="horizontal"
                    size="small"
                    dataSource={item.channels}
                    renderItem={(chann) => drawChannel(item, chann)}
                />
            </List.Item>
        );
    };

    /**
     * Metodo encargado de pintar un canal
     * @param {*} int
     * @param {*} chann
     * @returns
     */
    const drawChannel = (int, chann) => {
        return (
            <List.Item
                key={chann.id}
                actions={[
                    <span>v{chann.version}</span>,
                    <span>{moment(chann.last_updated).format("DD/MM/YYYY HH:mm:ss")}</span>,
                    <Badge showZero count={chann.messages_sent} style={{ backgroundColor: "green" }} />,
                    <Badge showZero count={chann.messages_error} />,
                    <Badge
                        showZero
                        count={chann.messages_total}
                        style={{
                            backgroundColor: "#2db7f5",
                        }}
                    />,
                ]}
                extra={<div className={classes.channelActions}>{drawChannelActionButtons(int, chann)}</div>}>
                <Space>
                    {drawChannelStatus(chann)}
                    <div className={classes.channelName}>
                        <Link
                            to={`/packages/${int.package_code}@${int.package_version}/integrations/${int.id}/${chann.id}`}>
                            {chann.name}
                        </Link>
                    </div>
                </Space>
            </List.Item>
        );
    };

    return (
        <Content className={"deployedIntegrations"}>
            <Row className={classes.card}>
                <Col flex={1}>
                    <Input.Search className={classes.search} onSearch={(element) => onSearch(element)} enterButton />
                </Col>
            </Row>

            <List
                itemLayout="vertical"
                size="large"
                pagination={pagination}
                dataSource={dataSource.data}
                footer={<div></div>}
                renderItem={drawIntegration}
                loading={loading}
            />
        </Content>
    );
};

export default DeployedIntegrations;
