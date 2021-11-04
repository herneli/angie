import Keycloak from "keycloak-connect";
import { App } from "lisco";

let _keycloak;

function initKeycloak() {
    var keycloakConfig = {
        realm: process.env.KEYCLOAK_REALM,
        "auth-server-url": process.env.KEYCLOAK_URL,
        "ssl-required": "external",
        resource: process.env.KEYCLOAK_BACK_CLI,
        "public-client": true,
        "confidential-port": 0,
    };

    if (_keycloak) {
        console.warn("Trying to init Keycloak again!");
    } else {
        console.log("Initializing Keycloak...");
        _keycloak = new Keycloak({}, keycloakConfig);
    }
}

function getKeycloak() {
    if (!_keycloak) {
        console.error(
            "Keycloak has not been initialized. Please called init first."
        );
    }
    return _keycloak;
}

export { initKeycloak, getKeycloak };
