import { App, BaseController, JsonResponse } from "lisco";
import { UserService } from "./UserService";

import expressAsyncHandler from "express-async-handler";

export class UserController extends BaseController {
    configure() {
        super.configure("user", { service: UserService });

        this.router.get(
            "/login",
            App.keycloak.protect("realm:default-roles-angie"),
            expressAsyncHandler((request, response, next) => {
                this.login(request, response, next);
            })
        );
        this.router.get(
            "/logout",
            expressAsyncHandler((request, response, next) => {
                this.logout(request, response, next);
            })
        );
        this.router.post(
            "/importUsers",
            expressAsyncHandler((res, req, next) => {
                this.importUsers(res, req, next);
            })
        );

        //listen on events to update Keycloak data
        App.events.on("config_deleted_users", (id) => {
            // this.deleteUser(id.id);
        });
        App.events.on("config_saved_users", (data) => {
            // this.saveUsers(data.model, data.body);
        });
        App.events.on("config_updated_users", (data) => {
            // this.updateUser(data.model, data.body, data.id);
        });


        return this.router;
    }

    async login(request, response) {
        let username = "";
        let header = [];
        let content = [];
        if (request.headers.authorization) {
            header, (content = App.Utils.parseToken(request));
        }
        username = content.preferred_username;

        var jsRes = new JsonResponse();
        jsRes.success = false;
        jsRes.message = `Hello '${username}' `;
        response.json(jsRes);
    }
    /**
     * Import Users desde Keycloak
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
    async importUsers(request, response, next) {
        try {
            await UserService.importKeycloakUsers();

            const jsRes = new JsonResponse(true);
            response.status(200).json(jsRes);
        } catch (e) {
            next(e);
        }
    }

    /*
     */
    saveUsers(mode, body) {
        try {
            return App.keycloakAdmin.users.create(body);
        } catch (e) {
            console.log(e);
        }
    }

    async updateUser(mode, body, id) {
        try {
            delete body.roles;
            delete body.profile;
            delete body.organization_id;
            delete body.email_verified;
            return await App.keycloakAdmin.users.update({ id: id }, body);
        } catch (e) {
            console.log(e);
        }
    }

    /*
     */
    async deleteUser(id) {
        try {
            return await App.keycloakAdmin.users.del({ id: id });
        } catch (e) {
            console.log(e);
        }
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
        request.clearCookie("connect.sid", { path: "/" });
        request.redirect(App.keycloak.logoutUrl());
    }
}
