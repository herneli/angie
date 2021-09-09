import { BaseController, JsonResponse } from 'lisco';
import { UserService } from "./";
import lodash from 'lodash';
import { UserSettingsService } from '../user_settings';

const asyncHandler = require('express-async-handler')

export class UserController extends BaseController {

    configure() {
        super.configure('users', { service: UserService });

        this.router.get('/login', ((res, req, next) => { this.login(res, req, next); }));
        this.router.get('/getUser', asyncHandler((res, req, next) => { this.getSession(res, req, next); }));


        return this.router;
    }


    login(request, response) {
        var jsRes = new JsonResponse();
        jsRes.success = false;
        jsRes.status = 403;
        jsRes.message = "Unauthorized";
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
    async getSession(request, response) {
        if (request.session.username) {
            var service = new UserService();
            let auth = await service.findByUsername(request.session.username);

            let jsRes = new JsonResponse(true, lodash.omit(auth, 'password'), "", 1);
            return response.json(jsRes.toJson());
        }
        return response.status(403).json(new JsonResponse(false, "No session", "", 1));
    }



    updateDashboard (request, response) {
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
