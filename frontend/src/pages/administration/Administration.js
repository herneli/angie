import { Layout } from "antd";
import React from "react";
import { Route, Switch } from "react-router";
import { PrivateRoute } from "../../components/security/PrivateRoute";
import SubMenu from "./AdminSubMenu";

import ModelAdmin from "../../pages/configuration/ModelAdmin";
import Script from "../../pages/script/Script";
import UsersConfig from "./Users/UsersConfig";
import Integration from "./integration/Integration";
import Integrations from "./integration/Integrations";
import OrganizationConfig from "./organization/OrganizationConfig";

const Administration = ({ app }) => {
    const { Content } = Layout;
    const defaultProps = {
        app: app,
    };
    return (
        <Layout>
            <SubMenu parent={"/admin"}/>

            <Layout>
                <Content>
                    <Switch>
                        <Route
                            exact
                            path="/admin/integration"
                            render={({ match }) => <Integrations match={match} {...defaultProps} />}
                        />
                        <Route
                            exact
                            path="/admin/integration/:id"
                            render={({ match }) => <Integration match={match} {...defaultProps} />}
                        />
                        <Route
                            exact
                            path="/admin/users"
                            render={({ match }) => <UsersConfig match={match} {...defaultProps} />}
                        />
                        <Route
                            exact
                            path="/admin/organization"
                            render={({ match }) => <ModelAdmin match={match} model="organization_config" />}
                        />
                        <Route
                            exact
                            path="/admin/profiles"
                            render={({ match }) => <ModelAdmin match={match} model="profile_config" />}
                        />

                        {/* <Route
                            exact
                            path="/admin/organization"
                            render={({ match }) => (
                                <OrganizationConfig
                                    match={match}
                                    {...defaultProps}
                                />
                            )}
                        /> */}

                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/node_type"
                            component={() => <ModelAdmin model="node_type" />}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/camel_component"
                            component={() => <ModelAdmin model="camel_component" />}
                            {...defaultProps}
                        />

                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/config_method"
                            component={() => <ModelAdmin model="script_method" />}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/config_object"
                            component={() => <ModelAdmin model="script_object" fixedData={{ customGroup: "" }} />}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/config_context"
                            component={() => <ModelAdmin model="script_context" />}
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
