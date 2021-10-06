import { App, BaseController, JsonResponse } from 'lisco';

const asyncHandler = require('express-async-handler')


export class UserController extends BaseController {

    configure() {

        this.router.get('/login', App.keycloak.protect("realm:user") ,asyncHandler((res, req, next) => { this.login(res, req, next); }));
        this.router.get('/logout', asyncHandler((res, req, next) => { this.logout(res, req, next); }));
        this.router.get('/anonymous', App.keycloak.protect("realm:protect") , function (req, res) {
            var jsRes = new JsonResponse();
            jsRes.success = false;
            jsRes.message = "Hello admin";
            response.json("Hello admin");
        });

        return this.router;
    }


    login(request, response) {
        var jsRes = new JsonResponse();
        jsRes.success = false;
        jsRes.message = "Hello admin";
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
