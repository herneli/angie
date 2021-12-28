import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import MenuHandler from "../../common/MenuHandler";

export function PrivateRoute({ component: Component, roles, path, ...rest }) {
    const { keycloak } = useKeycloak();

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

    const check = async (path) => {
        const response = await MenuHandler.hasRealmRoleForPath(keycloak.tokenParsed.sub, path);
        return response;
    };

    // if (!auth) return null;

    return (
        <Route
            {...rest}
            render={(props) => {
                return isAutherized(roles) && check(path) ? (
                    <Component {...props} />
                ) : (
                    <Redirect to={{ pathname: "/" }} />
                );
            }}
        />
    );
}
