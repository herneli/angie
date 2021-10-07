import Keycloak from 'keycloak-connect';
import { App } from 'lisco';

let _keycloak;



function initKeycloak() {

    var keycloakConfig = {
        "realm": App.settings.getConfigValue("core:keycloak:realm"),
        "auth-server-url": App.settings.getConfigValue("core:keycloak:url"),
        "ssl-required": "external",
        "resource": App.settings.getConfigValue("core:keycloak:back-client"),
        "public-client": true,
        "confidential-port": 0
    };

    if (_keycloak) {
        console.warn("Trying to init Keycloak again!");
    }
    else {
        console.log("Initializing Keycloak...");
        _keycloak = new Keycloak({}, keycloakConfig);
    }
}

function getKeycloak() {
    if (!_keycloak) {
        console.error('Keycloak has not been initialized. Please called init first.');
    }
    return _keycloak;
}

export {
    initKeycloak,
    getKeycloak
};