import { App, BaseController, JsonResponse } from 'lisco';

const asyncHandler = require('express-async-handler')


export class UserController extends BaseController {

    configure() {

        this.router.get('/login', App.keycloak.protect("realm:default-roles-angie"), asyncHandler((request, response, next) => { this.login(request, response, next); }));
        this.router.get('/logout', asyncHandler((request, response, next) => { this.logout(request, response, next); }));
        this.router.get('/anonymous', App.keycloak.protect("realm:default-roles-angie"), function (request, response) {
            var jsRes = new JsonResponse();
            jsRes.success = false;
            jsRes.message = "Hello admin";
            response.json("Hello admin");
        });

        return this.router;
    }


    async login(request, response) {
        let username = "";
        if (request.headers.authorization) {
            let token = request.headers.authorization.replace('bearer ', '').replace('Bearer ', '');
            const parts = token.split('.');
            const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
            const content = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            // console.log(decoded);
            username = content.preferred_username;
        }

        var jsRes = new JsonResponse();
        jsRes.success = false;
        jsRes.message = `Hello '${username}' `;
        response.json(jsRes);
    }

    /**
     * Cierre de sessión
     *
     *
     * @ {get} /logout Request Session information
     * @ Log out
     * @ User
     *
     *
     * @ {Boolean} success
     * @ {Object[]} data  dataObject
     * @ {String} Username  Nombre de usuario
     */
    logout(request, response) {
        response.session.destroy();
        request.clearCookie('connect.sid', { path: '/' });
        request.redirect(App.keycloak.logoutUrl());
    }



}
