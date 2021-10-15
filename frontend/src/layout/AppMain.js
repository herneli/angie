import React, { useEffect } from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { PrivateRoute } from "./PrivateRoute";

import Routes from "../pages/Routes";
import Home from "../pages/Home";
import Test from "../pages/configuration/Test";

const AppMain = ({ app, location }) => {
    const { initialized } = useKeycloak();

    const defaultProps = {
        app: app,
    };

    if (!initialized) {
        return <h3>Cargando ... !!!</h3>;
    }

    return (
        <Switch>
            <Route
                exact
                path="/"
                render={({ match }) => <Home match={match} {...defaultProps} />}
            />
            <PrivateRoute
                roles={["default-roles-angie"]}
                path="/drag"
                component={Routes}
                {...defaultProps}
            />
            <PrivateRoute
                roles={["default-roles-angie"]}
                path="/config"
                component={Test}
                {...defaultProps}
            />
        </Switch>
    );
};

export default withRouter(AppMain);
