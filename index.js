import { App, AuthController, JwtAuthHandler, KnexConnector, Utils } from 'lisco'
import { UserController, UserDao } from './app/server/api/user';
import { MainController } from './app/server/api/main';
import Settings from './app/server/common/Settings';

module.exports = async () => {


    const optimist = require('optimist').usage("Como usar: \n node execute.js [--generateKeys , --encrypt xxx] \n\n Opciones:\n --generateKeys: Genera unas claves para JWT\n --encrypt String: Codifica el String proporcionado en base a la contraseña de .env \n\n ---> Si no se especifican parámetros el servidor arrancará normalmente.");
    const argv = optimist.argv;

    //Parámetro para no arrancar el servidor y generar las claves JWT
    if (argv.generateKeys) {
        console.log("Generando claves para JWT:");
        return console.log(Utils.generateKeys());
    }

    if (argv.encrypt) {
        console.log("Resultado encryptación:");
        return console.log(Utils.encrypt(argv.encrypt));
    }

    if (argv.h) {
        return console.log(optimist.help());
    }

    KnexConnector.init(require('./knexfile')[process.env.NODE_ENV]);

    await KnexConnector.test();

    //Configurar la gestion de cookies
    App.customizeExpress = (app) => {
        //TODO 
    };

    App.statics = {
        "/statics": "app/statics"
    }

    //Rutas que no necesitan haber iniciado sesion
    const publicPaths = [
        "/",
        "/login",
        "/translation",
        "/settings/load",
        "/menu",
        "/external"
    ]

    //Cargar las configuraciones
    App.settings = new Settings();
    App.settings.load();

    //Establecer los controladores activos
    App.routes = [
        new AuthController(publicPaths, new JwtAuthHandler(new UserDao())),
        new UserController(),
        new MainController()
    ]

    //Inicializar los componentes
    await App.init();


    App.executeOnlyMain = async () => {
        //Acciones a ejecutar sobre el mainWorker
        console.log("MainThread")

        //TODO Clear Historic
    }


    //ARrancar la aplicacion
    await App.start();

    App.server.on('listening', () => {
        console.log('Server Ready to Serve 😄');
    })

};
