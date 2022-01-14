import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { PrivateRoute } from "../components/security/PrivateRoute";
import Packages from "../pages/administration/packages/Packages";

import Home from "../pages/Home";
import Administration from "../pages/administration/Administration";
import Package from "../pages/administration/packages/Package";
import Agents from "../pages/agents/Agents";
import DeployedIntegrations from "../pages/deployed_integrations/DeployedIntegrations";
import Messages from "../pages/administration/message/Messages";
import Unauth from "../pages/Unauth";

const AppMain = ({ location }) => {
    const { initialized } = useKeycloak();

    const defaultProps = {};

    if (!initialized) {
        return <div />;
    }

    return (
        <Switch>
            <Route exact path="/" render={({ match }) => <Home match={match} {...defaultProps} />} />
            <Route exact path="/403" render={({ match }) => <Unauth match={match} {...defaultProps} />} />
            <PrivateRoute roles={["admin"]} path="/admin" component={Administration} {...defaultProps} />
            <PrivateRoute
                roles={["admin"]}
                exact
                path="/messages/:integration_id/:channel_id"
                component={Messages}
                {...defaultProps}
            />
            <PrivateRoute roles={["admin"]} exact path="/packages" component={Packages} {...defaultProps} />
            <PrivateRoute
                roles={["admin"]}
                path="/packages/:packageCode/versions/:packageVersion"
                component={Package}
                {...defaultProps}
            />
            <PrivateRoute
                roles={["admin", "user"]}
                exact
                path="/integrations/deployed"
                component={DeployedIntegrations}
                {...defaultProps}
            />
            <PrivateRoute roles={["admin"]} path="/agents" component={Agents} {...defaultProps} />
        </Switch>
    );
};

export default withRouter(AppMain);
