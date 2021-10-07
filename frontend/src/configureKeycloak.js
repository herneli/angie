import Keycloak from 'keycloak-js'
import Config from './common/Config';


const configureKeycloak = () => {
    return new Keycloak(Config.getKeycloakConfig());
}


export default configureKeycloak;