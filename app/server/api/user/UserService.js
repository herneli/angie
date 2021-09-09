import { Utils, BaseService } from 'lisco';
import UserDao from './UserDao';


export class UserService extends BaseService {

    constructor() {
        super(UserDao)
    }

    //TODO migrate passwords to new system CRYPT IV

    /**
     * Sobreescritura del metodo save del base service para establecer los atributos
     * del modelo.
     */
    save(data) {
        let user = { ...data }
        if (user.password) {
            user.password = Utils.encrypt(user.password);
        } else {
            delete user.password;
        }


        return super.save(user);
    }
    /**
     * Sobreescritura del metodo save del base service para establecer los atributos
     * del modelo.
     */
    update(id, data) {
        let user = { ...data }
        if (user.password) {
            user.password = Utils.encrypt(user.password);
        } else {
            delete user.password;
        }


        return super.update(id, user);
    }


    findByUsername(username) {
        return this.dao.findByUsername(username);
    }

}

