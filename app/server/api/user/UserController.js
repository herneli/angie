import { App, BaseController, JsonResponse } from 'lisco';
import { UserService } from "./";
import lodash from 'lodash';
import { UserSettingsService } from '../user_settings';

const asyncHandler = require('express-async-handler')


export class UserController extends BaseController {

    configure() {
        super.configure('users', { service: UserService });

        this.router.get('/login', App.keycloak.protect("realm:user") ,asyncHandler((res, req, next) => { this.login(res, req, next); }));
        this.router.get('/getUser', asyncHandler((res, req, next) => { this.getSession(res, req, next); }));
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
     *Obtiene el usuario que ha iniciado sesion
     *
     *
     * @ {get} /session Request Session information
     * @ Obtener usuario
     * @ User
     *
     *
     * @ {Boolean} success
     * @ {Object[]} data  dataObject
     * @ {String} Username  Nombre de usuario
     */

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


    updateDashboard(request, response) {
        var service = new UserService();
        var jsRes = new JsonResponse();

        service.updateConfigColumn(request.params.id, 'dashboard', request.body, function (err, data) {
            jsRes.success = true;
            jsRes.data = data;
            if (err) {
                console.error(err);
                jsRes.success = false;
                jsRes.message = err;
            }
            response.json(jsRes);
        });
    }



}
