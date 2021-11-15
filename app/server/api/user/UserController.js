import { App, BaseController, JsonResponse } from 'lisco';
import { UserService } from './UserService';

import expressAsyncHandler from "express-async-handler";

export class UserController extends BaseController {
    configure() {
        super.configure('user', { service: UserService });

        this.router.get('/login', App.keycloak.protect("realm:default-roles-angie"), expressAsyncHandler((request, response, next) => { this.login(request, response, next); }));
        this.router.get('/logout', expressAsyncHandler((request, response, next) => { this.logout(request, response, next); }));
        this.router.post('/importUsers', expressAsyncHandler((res, req, next) => { this.importUsers(res, req, next); }));
        this.router.post('/saveUser', expressAsyncHandler((res, req, next) => { this.saveUsers(res, req, next); }));
        this.router.post('/deleteUser', expressAsyncHandler((res, req, next) => { this.deleteUser(res, req, next); }));

        return this.router;
    }

    async login(request, response) {
        let username = "";
        let  header = []
        let content =[]
        if(request.headers.authorization){
            header,content =  App.Utils.parseToken(request)
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
            let usersTosave = []
            let users =  App.keycloakAdmin.users ? await App.keycloakAdmin.users.find() : []
            for await (let e of users) {
                let roles = await App.keycloakAdmin.users.listRoleMappings({
                    id: e.id,
                });
                roles.pop
                let groups = await App.keycloakAdmin.users.listGroups({
                    id: e.id,
                });
                delete e.totp
                delete e.disableableCredentialTypes
                delete e.requiredActions
                delete e.notBefore
                delete e.access
                delete e.firstName
                e.created_time_stamp = e.createdTimeStamp
                delete e.createdTimestamp
                e.email_verified = e.emailVerified
                delete e.emailVerified
                e.roles = JSON.stringify(roles)

                let exists = await bServ.loadById(e.id)
                if(exists.length > 0){
                    let r = {
                        id: e.id,
                        document_type : "object",
                        code: e.username,
                        data: e
                    }
                    let update = await bServ.update(r.id,r)
                }else{
                    let r = {
                        id: e.id,
                        document_type : "object",
                        code: e.username,
                        data: e
                    }
                    usersTosave.push(r)
                }
            }
            

            let data  = usersTosave.length > 0 ? await bServ.save(usersTosave)   : []
            jsRes.success = false;
            jsRes.message = users;
            response.json(jsRes);
        } catch (e) {
            next(e);
        }

    }

    /*
    */
    async saveUsers(request, response, next) {
        try {
            const bServ = new UserService();
            var jsRes = new JsonResponse();
            delete request.body.organization_id
            let data =  await App.keycloakAdmin.users.create(request.body);
            
            request.body.id = data.id
            await bServ.save(request.body)
            jsRes.success = false;
            jsRes.message = data;
            response.json(jsRes);
        } catch (e) {
            next(e);
        }

    }


    /*
    */
     async deleteUser(request, response, next) {
        try {
            const bServ = new UserService();
            var jsRes = new JsonResponse();
            let data =  await App.keycloakAdmin.users.del({id: request.body.id});
            
            await bServ.delete(request.body.id)
            jsRes.success = false;
            jsRes.message = data;
            response.json(jsRes);
        } catch (e) {
            next(e);
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
