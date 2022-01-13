import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import { useLocation } from "react-router";
import { Redirect, Route } from "react-router-dom";
import MenuHandler from "../../common/MenuHandler";
import { useAngieSession } from "./UserContext";

export function PrivateRoute({ component: Component, render, roles, path, ...rest }) {
    const { keycloak } = useKeycloak();
    const { currentAllowedPaths } = useAngieSession();

    const isAutherized = (roles) => {
        if (keycloak && roles) {
            return roles.some((r) => {
                const realm = keycloak.hasRealmRole(r);
                const resource = keycloak.hasResourceRole(r);
                return realm || resource;
            });
        }
        return false;
    };

    let { pathname } = useLocation();

    const check = (routePath) => {
        return MenuHandler.pathAllowed(currentAllowedPaths || [], routePath, pathname);
    };

    return (
        <Route
            {...rest}
            render={(props) => {
                if (!isAutherized(roles)) {
                    return <Redirect to={{ pathname: "/403" }} />;
                }
                if (!check(path)) {
                    return <Redirect to={{ pathname: "/403" }} />;
                }
                if (render) {
                    return render(props);
                }
                return <Component {...props} {...rest} />;
            }}
        />
    );
}
