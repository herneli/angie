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
        App.events.on("config_deleted_users_config", (id) => {
            this.deleteUser(id.id);
        });
        App.events.on("config_saved_users_config", (data) => {
            this.saveUsers(data.model, data.body);
        });
        App.events.on("config_updated_users_config", (data) => {
            this.updateUser(data.model, data.body, data.id);
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
            const bServ = new UserService();
            var jsRes = new JsonResponse();
            let usersTosave = [];
            let users = App.keycloakAdmin.users ? await App.keycloakAdmin.users.find() : [];
            for await (let e of users) {
                let roles = await App.keycloakAdmin.users.listRoleMappings({
                    id: e.id,
                });
                roles.pop;
                let groups = await App.keycloakAdmin.users.listGroups({
                    id: e.id,
                });
                delete e.totp;
                delete e.disableableCredentialTypes;
                delete e.requiredActions;
                delete e.notBefore;
                delete e.access;
                delete e.firstName;
                e.created_time_stamp = e.createdTimeStamp;
                delete e.createdTimestamp;
                e.email_verified = e.emailVerified;
                delete e.emailVerified;
                e.roles = JSON.stringify(roles);

                let exists = await bServ.loadById(e.id);
                if (exists) {
                    let r = {
                        id: e.id,
                        document_type: "user",
                        code: e.username,
                        data: e,
                    };
                    r = { ...exists, ...r };
                    let update = await bServ.update(r.id, r);
                } else {
                    let r = {
                        id: e.id,
                        document_type: "user",
                        code: e.username,
                        data: e,
                    };
                    usersTosave.push(r);
                }
            }

            let data = usersTosave.length > 0 ? await bServ.save(usersTosave) : [];
            jsRes.success = false;
            jsRes.message = users;
            response.json(jsRes);
        } catch (e) {
            next(e);
        }
    }

    /*
     */
    saveUsers(mode, body) {
        try {
            return App.keycloakAdmin.users.create(body);;
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
