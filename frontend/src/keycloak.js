import Keycloak from 'keycloak-js'

const KEYCLOAK_URL = 'http://localhost:3114/auth';
const KEYCLOAK_REALM = 'Angie';
const KEYCLOAK_CLIENT_ID = 'angie-front';

const keycloakConfig = {
    url: KEYCLOAK_URL,
    realm: KEYCLOAK_REALM,
    clientId: KEYCLOAK_CLIENT_ID
}
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;