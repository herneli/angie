import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { PrivateRoute } from "../components/security/PrivateRoute";
import Packages from "../pages/administration/packages/Packages";

import Home from "../pages/Home";
import Administration from "../pages/administration/Administration";
import Package from "../pages/administration/packages/Package";

const AppMain = ({ app, location }) => {
    const { initialized } = useKeycloak();

    const defaultProps = {
        app: app,
    };

    if (!initialized) {
        return <div />;
    }

    return (
        <Switch>
            <Route exact path="/" render={({ match }) => <Home match={match} {...defaultProps} />} />
            <PrivateRoute roles={["default-roles-angie"]} path="/admin" component={Administration} {...defaultProps} />
            <PrivateRoute
                roles={["default-roles-angie"]}
                exact
                path="/packages"
                component={Packages}
                {...defaultProps}
            />
            <PrivateRoute
                roles={["default-roles-angie"]}
                path="/packages/:packageId"
                component={Package}
                {...defaultProps}
            />
        </Switch>
    );
};

export default withRouter(AppMain);
