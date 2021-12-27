import { Layout } from "antd";
import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router";
import { PrivateRoute } from "../../components/security/PrivateRoute";
import SubMenu from "./AdminSubMenu";
import { Redirect } from 'react-router-dom';

import ModelAdmin from "../../pages/configuration/ModelAdmin";
import Script from "../../pages/script/Script";
import UsersConfig from "./Users/UsersConfig";
import Integration from "./integration/Integration";
import Integrations from "./integration/Integrations";
import MenuHandler from "../../common/MenuHandler";
import { useKeycloak } from "@react-keycloak/web";

const Administration = ({ app }) => {
    const { Content } = Layout;
    const { keycloak } = useKeycloak();
    let allowed;
    const defaultProps = {
        app: app,
    };

    return (
        <Layout>
            <SubMenu parent={"/admin"} />

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
                            path="/admin/sections"
                            render={({ match }) => <ModelAdmin match={match} model="section_config" />}
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
                            allowed={false}
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
