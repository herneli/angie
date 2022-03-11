import { Task } from "./Task";
const { App } = require("lisco");
const { UserService } = require("../../user/UserService");
import { initKeycloak, getKeycloak } from "../../../../../config/keycloak-config";
import { keycloakAdmin } from "../../../../../config/keycloak-admin-client-config";

class RefreshUsersTask extends Task {
    constructor(props) {
        super(props);
    }

    async doLaunch() {
        console.debug("Init scheduled task RefreshUsersTask.");

        App.keycloakAdmin = await keycloakAdmin();

        // //Inicializa keycloak
        initKeycloak();

        App.keycloak = getKeycloak();

        await UserService.importKeycloakUsers();

        console.debug("End scheduled task RefreshUsersTask.");
    }
}

module.exports= {RefreshUsersTask}
