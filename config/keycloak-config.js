var Keycloak = require('keycloak-connect');

let _keycloak;

var keycloakConfig = {
    "realm": "Angie",
    "auth-server-url": "http://localhost:3114/auth/",
    "ssl-required": "external",
    "resource": "nodejs",
    "verify-token-audience": true,
    "credentials": {
        "secret": "82e78b54-1e22-4c04-8167-4605c8ca2a6e"
    },
    "use-resource-role-mappings": true,
    "confidential-port": 0,
    "policy-enforcer": {}
};


function initKeycloak(memoryStore) {
    if (_keycloak) {
        console.warn("Trying to init Keycloak again!");
    }
    else {
        console.log("Initializing Keycloak...");
        _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
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