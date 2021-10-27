import { Utils, BaseService } from 'lisco';
import { UserDao } from './UserDao';


export class UserService extends BaseService {

    constructor() {
        super(UserDao)
    }

    
}

