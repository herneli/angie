import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { PrivateRoute } from "../components/security/PrivateRoute";

import Home from "../pages/Home";
import Administration from "../pages/administration/Administration";

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
            <Route
                exact
                path="/"
                render={({ match }) => <Home match={match} {...defaultProps} />}
            />
            <PrivateRoute
                roles={["default-roles-angie"]}
                path="/admin"
                component={Administration}
                {...defaultProps}
            />

        </Switch>
    );
};

export default withRouter(AppMain);
