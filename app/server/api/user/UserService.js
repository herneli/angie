import { App, BaseService } from "lisco";
import { UserDao } from "./UserDao";
import lodash from "lodash";
import moment from "moment";

export class UserService extends BaseService {
    constructor() {
        super(UserDao);
    }

    async importKeycloakUsers() {
        let usersTosave = [];
        let users = App.keycloakAdmin.users ? await App.keycloakAdmin.users.find() : [];
        for await (let e of users) {
            let roles = await App.keycloakAdmin.users.listRoleMappings({
                id: e.id,
            });

            const user = {
                ...lodash.omit(e, [
                    "totp",
                    "disableableCredentialTypes",
                    "requiredActions",
                    "notBefore",
                    "access",
                    "firstName",
                    "createdTimestamp",
                    "emailVerified",
                ]),
                created_timestamp: moment(e.createdTimestamp).toISOString(),
                email_verified: e.emailVerified,
                roles: lodash.map(roles.realmMappings, "name").join(","),
            };
            // roles.pop; //!! FIXME  ??? esto que es?
            // let groups = await App.keycloakAdmin.users.listGroups({
            //     id: e.id,
            // });

            let userRecord = { id: user.id, document_type: "user", code: user.username, data: { ...user } };
            let exists = await this.loadById(user.id);
            if (exists) {
                //Si existe se actualiza
                userRecord.data = { ...exists.data, ...user };
                if (!userRecord.data.current_organization) {
                    userRecord.data.current_organization = "assigned";
                }
                userRecord = { ...exists, ...userRecord };

                await this.update(user.id, userRecord);
                continue;
            } else {
                userRecord.data.current_organization = "assigned";
            }
            //De lo contrario se introduce en el listado de elementos a guardar
            usersTosave.push(userRecord);
        }

        if (usersTosave.length > 0) {
            await this.save(usersTosave);
        }
    }

    loadByUsername(username) {
        return this.dao.loadByUsername(username);
    }
}
