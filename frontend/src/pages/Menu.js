import { withKeycloak } from '@react-keycloak/web';
import React from 'react';
import { Link } from 'react-router-dom';
import AuthorizedFunction from '../layout/AuthorizedFunction';

const Menu = ({ keycloak, keycloakInitialized }) => {

    return (
        <ul className="menuList">
            <li><Link to="./">Home Page </Link></li>
            {AuthorizedFunction(["default-roles-angie"]) && <li><Link to="./drag">Drag </Link></li>}

            {keycloak && !keycloak.authenticated &&
                <li><a className="btn-link" onClick={() => keycloak.login()}>Login</a></li>
            }

            {keycloak && keycloak.authenticated &&
                <li>
                    <a className="btn-link" onClick={() => keycloak.logout()}>Logout ({
                        keycloak.tokenParsed.preferred_username
                    })</a>
                </li>
            }

        </ul>
    )
}

export default withKeycloak(Menu)