import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { PrivateRoute } from "./PrivateRoute";

import Routes from "../pages/Routes";
import Home from "../pages/Home";
import Test from "../pages/configuration/Test";
import ModelAdmin from "../pages/configuration/ModelAdmin";
import VisualScript from "../components/visual-script/VisualScript";
import Script from "../pages/script/Script";

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
                path="/config_method"
                component={() => <ModelAdmin model="script_method" />}
                {...defaultProps}
            />
            <PrivateRoute
                roles={["default-roles-angie"]}
                path="/config_object"
                component={() => <ModelAdmin model="script_object" />}
                {...defaultProps}
            />
            <PrivateRoute
                roles={["default-roles-angie"]}
                path="/script"
                component={Script}
                {...defaultProps}
            />
        </Switch>
    );
};

export default withRouter(AppMain);
