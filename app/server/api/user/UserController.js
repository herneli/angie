import { App, BaseController, JsonResponse } from 'lisco';
import jsonwebtoken from 'jsonwebtoken';

const asyncHandler = require('express-async-handler')


export class UserController extends BaseController {

    configure() {

        this.router.get('/login', App.keycloak.protect("realm:default-roles-angie"), asyncHandler((res, req, next) => { this.login(res, req, next); }));
        this.router.get('/logout', asyncHandler((res, req, next) => { this.logout(res, req, next); }));
        this.router.get('/anonymous', App.keycloak.protect("realm:default-roles-angie"), function (req, res) {
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
        req.session.destroy();
        res.clearCookie('connect.sid', { path: '/' });
        res.redirect(App.keycloak.logoutUrl());
    }



}
