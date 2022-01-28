import { App, KnexConnector } from "lisco";
import { UserController, UserService } from "./app/server/api/user";
import { MainController } from "./app/server/api/main";
import { Settings, Utils } from "./app/server/common";
import { handleResponses, handleRequests, SPEC_OUTPUT_FILE_BEHAVIOR } from "express-oas-generator";
import { initKeycloak, getKeycloak } from "./config/keycloak-config";
import { keycloakAdmin } from "./config/keycloak-admin-client-config";
import { Runtime } from "./app/server/common/";
import { IntegrationController } from "./app/server/api/integration";
import { IntegrationChannelController } from "./app/server/api/integration_channel";
import { MessageController } from "./app/server/api/messages";
import { OrganizationController } from "./app/server/api/organization";
import { PackageController } from "./app/server/api/package";
import { ScriptController } from "./app/server/api/script";
import { ConfigurationController } from "./app/server/api/configuration/ConfigurationController";
import { SectionController } from "./app/server/api/section/SectionController";

import { contentSecurityPolicy } from "helmet";

import lodash from "lodash";
import { JUMAgentController, JUMAgentMaster } from "./app/server/api/jum_agents";
import Cache from "./app/server/common/Cache";
import { LibraryController } from "./app/server/api/library/LibraryController";

module.exports = async () => {
    Runtime(); //Ejecuta la Runtime para los comandos como generateKeys,etc.

    KnexConnector.init(require("./knexfile")[process.env.NODE_ENV]);
    await KnexConnector.test(); //Comprueba la conexión con BD

    /**
     * Gestor de configuraciones
     * @type {Settings}
     * @public
     */
    App.settings = new Settings();
    App.Utils = new Utils();
    App.settings.load();

    //Configurar la gestion de cookies
    App.customizeExpress = async (app) => {
        handleResponses(app, {
            //Escucha las respuestas para ir generando la openapi
            specOutputPath: __dirname + "/openapi.json",
            ignoredNodeEnvironments: ["production"],
            tags: ["user", "integration", "organization", "config_model", "script", "configuration"],
            specOutputFileBehavior: SPEC_OUTPUT_FILE_BEHAVIOR.PRESERVE,
        });

        /**
         * Esto es una api directa contra la administracion del keycloak desde el backend
         * Enlace a la docu : https://github.com/keycloak/keycloak-nodejs-admin-client
         * @type {KcAdminClient}
         * @public
         */
        App.keycloakAdmin = await keycloakAdmin();

        //Inicializa keycloak
        initKeycloak();

        /**
         * Current keycloak
         * @type {Keycloak}
         * @public
         */
        App.keycloak = getKeycloak();
        app.use(App.keycloak.middleware({ logout: "/logout" }));
    };

    App.beforeListen = () => {
        handleRequests(); //Escucha las solicitudes para ir generando la openapi
    };

    App.statics = {
        "/front": "app/statics", //Statics del frontend para el modo production
        "/plugins": "app/plugins", //Se desplegarán ahí los plugins activos y se servirán como statics
    };

    //Establecer los controladores activos
    App.routes = [
        new UserController(),
        new MainController(),
        new IntegrationController(),
        new IntegrationChannelController(),
        new OrganizationController(),
        new ConfigurationController(),
        new ScriptController(),
        new PackageController(),
        new JUMAgentController(),
        new SectionController(),
        new MessageController(),
        new LibraryController(),
    ];

    const directives = {
        ...lodash.omit(contentSecurityPolicy.getDefaultDirectives(), ["upgrade-insecure-requests"]),
        "default-src": "dangerouslyDisableDefaultSrc", //FIXME necesario revisarlo
        "connect-src": ["'self'", "http://localhost:3114", "http://localhost:6100"],
    };
    //Inicializar los componentes
    await App.init({
        helmet: {
            frameguard: {
                action: "sameorigin",
            },
            hsts: false,
            contentSecurityPolicy: false, //TODO: Revisar funcionamiento
            // contentSecurityPolicy: {
            //     useDefaults: false,
            //     directives: directives,
            // },
        },
        socketio: { transports: ["websocket"], pingTimeout: 60 * 1000 },
    });

    App.executeOnlyMain = async () => {
        //Start agentListening
        await JUMAgentMaster.listenForAgents(App.server.app.io);

        //Acciones a ejecutar sobre el mainWorker
        console.log("MainThread");

        setTimeout(async () => {
            console.log("Import Users From Keycloak");
            await UserService.importKeycloakUsers();
            console.log("Import Process has being completed.");
        }, 2 * 1000);
    };

    await Cache.resetAll();

    //Arrancar la aplicacion
    await App.start();
    App.server.on("listening", () => {
        console.log("Server Ready to Serve 😄");
    });
};
