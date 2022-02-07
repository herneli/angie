import { Layout } from "antd";
import React from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router";
import { PrivateRoute } from "../../components/security/PrivateRoute";
import SubMenu from "../../layout/SubMenu";

import EntityDetail from "./entity/EntityDetail";
import EntityList from "./entity/EntityList";
import MessagesStatusMap from "./messages/MessagesStatusMap";

const Explore = ({ app }) => {
    const { Content } = Layout;
    const defaultProps = {
        app: app,
    };

    let { url } = useRouteMatch();

    return (
        <Layout>
            <SubMenu parent={"/explore"} url={url} />
            <Layout>
                <Content>
                    <Switch>
                        <Route exact path={"/explore"}>
                            <Redirect to="/explore/entity" />
                        </Route>
                        <PrivateRoute
                            roles={["admin", "user"]}
                            exact
                            path="/explore/messages"
                            component={MessagesStatusMap}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["admin", "user"]}
                            exact
                            path="/explore/entity"
                            component={EntityList}
                            {...defaultProps}
                        />
                        <PrivateRoute
                            roles={["admin", "user"]}
                            exact
                            path="/explore/entity/:id"
                            component={EntityDetail}
                            {...defaultProps}
                        />
                    </Switch>
                </Content>
            </Layout>
        </Layout>
    );
};
export default Explore;
