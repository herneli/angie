import { App, KnexConnector } from "lisco";
import { UserController } from "./app/server/api/user";
import { MainController } from "./app/server/api/main";
import { Settings } from "./app/server/common";
import {
    handleResponses,
    handleRequests,
    SPEC_OUTPUT_FILE_BEHAVIOR,
} from "express-oas-generator";
import { initKeycloak, getKeycloak } from "./config/keycloak-config";
import { Runtime } from "./app/server/common/";
import { IntegrationController } from "./app/server/api/integration";
import { NodeTypeController } from "./app/server/api/node_type";
import { IntegrationChannelController } from "./app/server/api/integration_channel";
import { OrganizationController } from "./app/server/api/organization";
import { CamelComponentController } from "./app/server/api/camel_component";
import { ScriptController } from "./app/server/api/script";
import { ConfigurationController } from "./app/server/api/configuration/ConfigurationController";

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
    App.settings.load();

    //Configurar la gestion de cookies
    App.customizeExpress = (app) => {
        handleResponses(app, {
            //Escucha las respuestas para ir generando la openapi
            specOutputPath: __dirname + "/openapi.json",
            ignoredNodeEnvironments: ["production"],
            tags: [
                "users",
                "integration",
                "camel_component",
                "organization",
                "node_type",
            ],
            specOutputFileBehavior: SPEC_OUTPUT_FILE_BEHAVIOR.PRESERVE,
        });

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
        new NodeTypeController(),
        new OrganizationController(),
        new CamelComponentController(),
        new ConfigurationController(),
        new ScriptController(),
    ];

    //Inicializar los componentes
    await App.init({
        helmet: {
            frameguard: {
                action: "sameorigin",
            },
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    defaultSrc: "dangerouslyDisableDefaultSrc",//FIXME necesario revisarlo
                    "connect-src": [
                        "'self'",
                        "http://localhost:3114",
                        "http://localhost:6100",
                    ],
                },
            },
        },
    });

    App.executeOnlyMain = async () => {
        //Acciones a ejecutar sobre el mainWorker
        console.log("MainThread");
    };

    //Arrancar la aplicacion
    await App.start();

    App.server.on("listening", () => {
        console.log("Server Ready to Serve 😄");
    });
};
