import { Layout } from "antd";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router";
import { PrivateRoute } from "../../components/security/PrivateRoute";
import SubMenu from "../../layout/SubMenu";

import ModelAdmin from "../../pages/configuration/ModelAdmin";
import ModelEdit from "../configuration/ModelEdit";
import UsersConfig from "./Users/UsersConfig";

const Administration = ({ app }) => {
    const { Content } = Layout;
    const defaultProps = {
        app: app,
    };

    let { url } = useRouteMatch();

    return (
        <Layout>
            <SubMenu parent={"/admin"} url={url} />

            <Layout>
                <Content>
                    <Switch>
                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/users/:id"
                            component={ModelEdit}
                            model={"users"}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/users"
                            component={UsersConfig}
                            {...defaultProps}
                        />

                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            exact
                            path={"/admin/:model"}
                            render={({ match }) => {
                                return <ModelAdmin model={match.params.model} />;
                            }}
                        />
                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            exact
                            path={"/admin/:model/:id"}
                            render={({ match }) => {
                                return <ModelEdit model={match.params.model} />;
                            }}
                        />
                    </Switch>
                </Content>
            </Layout>
        </Layout>
    );
};
export default Administration;
