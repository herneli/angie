var Keycloak = require('keycloak-connect');

let _keycloak;

var keycloakConfig = {
    "realm": "Angie",
    "auth-server-url": "http://localhost:3114/auth/",
    "ssl-required": "external",
    "resource": "nodejs",
    "verify-token-audience": true,
    "credentials": {
      "secret": "c215c724-3c67-4295-9a91-4c12c2ba9792"
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