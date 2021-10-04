import { App, AuthController, JwtAuthHandler, KnexConnector, Utils } from 'lisco'
import { UserController, UserDao } from './app/server/api/user';
import { MainController } from './app/server/api/main';
import { Settings } from './app/server/common';
import { handleResponses, handleRequests, SPEC_OUTPUT_FILE_BEHAVIOR } from 'express-oas-generator';
import { LdapHostController } from './app/server/api/ldaphost';
import { initKeycloak, getKeycloak } from './config/keycloak-config';
import  knexStore  from 'connect-session-knex';
import session from 'express-session'

module.exports = async () => {


    const optimist = require('optimist').usage("Como usar: \n node execute.js [--generateKeys , --encrypt xxx] \n\n Opciones:\n --generateKeys: Genera unas claves para JWT\n --encrypt String: Codifica el String proporcionado en base a la contraseña de .env \n\n ---> Si no se especifican parámetros el servidor arrancará normalmente.");
    KnexConnector.init(require('./knexfile')[process.env.NODE_ENV]);

    await KnexConnector.test();

    //Configurar la gestion de cookies
    App.customizeExpress = (app) => {
        handleResponses(app, {
            specOutputPath: __dirname + '/openapi.json',
            ignoredNodeEnvironments: ['production'],
            tags: ['users', 'ldap'],
            specOutputFileBehavior: SPEC_OUTPUT_FILE_BEHAVIOR.PRESERVE
        });

        const KnexSessionStore = knexStore(session);
//var memoryStore = new session.MemoryStore();
        app.use(session({
            store: new KnexSessionStore({
                knex: KnexConnector.connection,
                tablename: 'sessions_knex'
            }),
            secret: "afb66a52-b904-490e-881c-ddab111ad7e4",
            resave: true,
            rolling: true,
            httpOnly: true,
            saveUninitialized: true,
            cookie: { maxAge: (process.env.COOKIE_TIMEOUT || 3 * 60 * 60) * 1000 } // 1 Hour [30 days -> (30 * 24 * 60 * 60 * 1000)]
        }));

        initKeycloak(KnexSessionStore);

        App.keycloak = getKeycloak();

        app.use(App.keycloak.middleware({ logout: '/logout' }))


    };

    App.beforeListen = () => {
        handleRequests();
    }

    App.statics = {
        "/statics": "app/statics",
        "/plugins": "app/plugins" //Se desplegarán ahí los plugins activos y se servirán como statics
    }

    //Rutas que no necesitan haber iniciado sesion
    const publicPaths = [
        "/",
        "/login",
        "/translation",
        "/config",
        "/menu",
        "/external",
        "/api-docs/(.*)",
        "/api-docs/(.*)/(.*)",
        "/api-spec/(.*)",
        "/api-spec/(.*)/(.*)"
    ]

    //Cargar las configuraciones
    App.settings = new Settings();
    App.settings.load();

    //Establecer los controladores activos
    App.routes = [
        new UserController(),
        new LdapHostController(),
        new MainController()
    ]

    //Inicializar los componentes
    await App.init();



    App.executeOnlyMain = async () => {
        //Acciones a ejecutar sobre el mainWorker
        console.log("MainThread")
    }


    //Arrancar la aplicacion
    await App.start();

    App.server.on('listening', () => {
        console.log('Server Ready to Serve 😄');
    })

};
