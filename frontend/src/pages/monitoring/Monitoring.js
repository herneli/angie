import { Layout } from "antd";
import { Switch, useRouteMatch } from "react-router";
import SubMenu from "../../layout/SubMenu";
import { PrivateRoute } from "../../components/security/PrivateRoute";
import JumContexts from "./JumContexts";
import JumServers from "./JumServers";
import AngieNode from "./AngieNode";

const Monitoring = ({ app }) => {
    const { Content } = Layout;
    const defaultProps = {
        app: app,
    };

    let { url } = useRouteMatch();

    return (
        <Layout>
            <SubMenu parent={"/monitoring"} url={url} />

            <Layout>
                <Content>
                    <Switch>
                        <PrivateRoute
                            roles={["admin"]}
                            path="/monitoring/jum_contexts"
                            component={JumContexts}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["admin"]}
                            path="/monitoring/jum_servers"
                            component={JumServers}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["admin"]}
                            path="/monitoring/angie_node"
                            component={AngieNode}
                            {...defaultProps}
                        />
                    </Switch>
                </Content>
            </Layout>

        </Layout>
    );
}

export default Monitoring;
