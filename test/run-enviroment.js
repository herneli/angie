const { App, KnexConnector } = require("lisco");
const { Settings, Utils } = require("../app/server/common");
const { MockClient } = require("knex-mock-client");

before(async function () {
    //Esto sirve para poder iniciar la app y hacer pruebas de la API.
    //De momento no se usa pero en un futuro es una posibilidad

    // console.log('Starting test env');
    this.timeout(30 * 1000);
    // require('../loadapp.js')(false).then(() => {
    //     console.log('started')
    //     setTimeout(done, 300);
    // }).catch(done);

    //Arrancar la conexion
    KnexConnector.init({
        client: MockClient,
        dialect: "pg",
    });

    // //Rollback
    // await KnexConnector.connection.migrate.rollback({ env: "test" }, true);
    // //Actualizar la BD
    // await KnexConnector.connection.migrate.latest({ env: "test" });
    // await KnexConnector.connection.seed.run({ env: "test" });

    /**
     * Mocks para App
     */
    App.settings = new Settings();
    App.Utils = new Utils();
    App.keycloak = {
        protect: () => () => {},
        middleware: () => () => {},
        logoutUrl: () => {},
    };
    App.keycloakAdmin = {
        users: {
            listRoleMappings: () => ({}),
            listGroups: () => ({}),
            create: () => ({}),
            update: () => ({}),
            del: () => ({}),
        },
    };
    App.events = {
        on: () => {},
        emit: () => {},
    };
});
