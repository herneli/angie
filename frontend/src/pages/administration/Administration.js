import { Layout } from "antd";
import React from "react";
import { Route, Switch } from "react-router";
import { PrivateRoute } from "../../components/security/PrivateRoute";
import SubMenu from "./AdminSubMenu";

import ModelAdmin from "../../pages/configuration/ModelAdmin";
import Script from "../../pages/script/Script";
import CamelComponent from "./camel_component/CamelComponent";
import NodeType from "./node_type/NodeType";
import Integration from "./integration/Integration";

const Administration = ({ app }) => {
    const { Content } = Layout;
    const defaultProps = {
        app: app,
    };
    return (
        <Layout>
            <SubMenu />

            <Layout>
                <Content>
                    <Switch>
                        <Route
                            exact
                            path="/admin/integration"
                            render={({ match }) => (
                                <Integration match={match} {...defaultProps} />
                            )}
                        />
                        <Route
                            exact
                            path="/admin/node_type"
                            render={({ match }) => (
                                <NodeType match={match} {...defaultProps} />
                            )}
                        />
                        <Route
                            exact
                            path="/admin/camel_component"
                            render={({ match }) => (
                                <CamelComponent
                                    match={match}
                                    {...defaultProps}
                                />
                            )}
                        />

                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/config_method"
                            component={() => (
                                <ModelAdmin model="script_method" />
                            )}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/config_object"
                            component={() => (
                                <ModelAdmin model="script_object" />
                            )}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/script/:code"
                            component={Script}
                            {...defaultProps}
                        />
                    </Switch>
                </Content>
            </Layout>
        </Layout>
    );
};
export default Administration;
