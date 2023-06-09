import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import { Card, Col, Divider, Image, Layout, Row, Timeline } from "antd";
import GridLayout from "react-grid-layout";
import { Typography } from "antd";
import CustomIframe from "../components/iframe/CustomIframe";
import Config from "../common/Config";

const { Title } = Typography;
const { Content } = Layout;

const Home = () => {
    return (
        <Content style={{ backgroundColor: "rgb(240 242 245)" }}>
            <Title level={2} style={{ margin: 5, marginLeft: 10, marginTop: "-0.5%" }}>
                [Angie] Angie's Next Generation Integration Engine
            </Title>
            <Row span={24}>
                <Col span={16}>
                    <Card style={{ margin: 5 }}>
                        <CustomIframe
                            src={`${Config.getGrafanaURL()}/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=2&theme=light`}
                            width="100%"
                            frameBorder="0"
                            title="CPU"></CustomIframe>
                    </Card>
                    <Card style={{ margin: 5 }}>
                        <CustomIframe
                            src={`${Config.getGrafanaURL()}/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=4&theme=light`}
                            width="100%"
                            frameBorder="0"
                            title="Memory"></CustomIframe>
                    </Card>
                    <Card style={{ margin: 5 }}>
                        <CustomIframe
                            src={`${Config.getGrafanaURL()}/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=6&theme=light`}
                            width="100%"
                            frameBorder="0"
                            title="Event loop delay"></CustomIframe>
                    </Card>
                    <Card style={{ margin: 5 }}>
                        <CustomIframe
                            src={`${Config.getGrafanaURL()}/d-solo/5JC-1cank/angie?orgId=1&refresh=5s&panelId=8&theme=light`}
                            width="100%"
                            frameBorder="0"
                            title="Handlers"></CustomIframe>
                    </Card>
                </Col>
                <Col style={{ width: 500, height: "100%" }} span={8}>
                    <Card
                        style={{ marginLeft: 20, marginTop: 5, height: "50%" }}
                        title={"Version Changes"}
                        type={"inner"}>
                        <Timeline style={{ marginTop: 10 }}>
                            <Timeline.Item color="green">Create a service site</Timeline.Item>
                            <Timeline.Item color="green">Copy remote versions</Timeline.Item>
                            <Timeline.Item color="#00CCFF">
                                <p>Merge branch 'main' </p>
                                <p>#57 Mejoras de rendimiento</p>
                                <p>Update</p>
                            </Timeline.Item>
                            <Timeline.Item>
                                <p>Angie Grafana</p>
                                <p>RabbitMQ reorder UI and fix.</p>
                                <p>Mode fix</p>
                            </Timeline.Item>
                            <Timeline.Item color="#00CCFF">
                                <p>Custom color testing</p>
                            </Timeline.Item>
                        </Timeline>
                    </Card>
                    {/* <Image style={{ height: 310, width: 310, margin: "0px 60px" }} preview={false} src="/front/logo512.png" /> */}
                </Col>
            </Row>
        </Content>
    );
};
export default Home;
