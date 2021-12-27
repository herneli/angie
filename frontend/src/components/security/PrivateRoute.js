import { useKeycloak } from '@react-keycloak/web';
import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import MenuHandler from '../../common/MenuHandler';

export function PrivateRoute({ component: Component, roles,path, ...rest }) {

    const { keycloak } = useKeycloak();
    const [auth, setAuth] = useState(null);

    const isAutherized =  (roles) => {
        if (keycloak && roles) {
            return roles.some(r => {
                const realm = keycloak.hasRealmRole(r);
                const resource = keycloak.hasResourceRole(r);
                return (realm || resource);
            });
        }
        return false;
    }


    useEffect(() => {
        MenuHandler.hasRealmRoleForPath(keycloak.tokenParsed.sub,path).then((response) => {
                let data = true
                setAuth(data)
        });
      }, [path]);

    if (!auth) return null;

    return (
        <Route
            {...rest}
            render={props => {
                return isAutherized(roles) && auth
                    ? <Component {...props} />
                    : <Redirect to={{ pathname: '/', }} />
            }}
        />
    )
}