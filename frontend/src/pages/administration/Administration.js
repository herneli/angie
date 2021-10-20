import { Layout } from 'antd';
import React from 'react';
import { Route, Switch } from 'react-router';
import { PrivateRoute } from '../../components/security/PrivateRoute';
import SubMenu from './AdminSubMenu';

import Routes from './integration/Routes'

import ModelAdmin from "../../pages/configuration/ModelAdmin";
import Script from "../../pages/script/Script";

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
                            path="/admin/integrations"
                            render={({ match }) => <Routes match={match} {...defaultProps} />}
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
                            component={() => <ModelAdmin model="script_object" />}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["default-roles-angie"]}
                            path="/admin/script"
                            component={Script}
                            {...defaultProps}
                        />
                    </Switch>
                </Content>
            </Layout>

        </Layout >
    )
}
export default Administration