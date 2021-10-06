var Keycloak = require('keycloak-connect');

let _keycloak;

var keycloakConfig = {
    "realm": "Angie",
    "auth-server-url": "http://localhost:3114/auth/",
    "ssl-required": "external",
    "resource": "angie-back",
    "public-client": true,
    "confidential-port": 0
};


function initKeycloak() {
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