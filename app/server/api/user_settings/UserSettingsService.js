import { Utils, BaseService } from 'lisco';
import UserSettingsDao from './UserSettingsDao';


export class UserSettingsService extends BaseService {

    constructor() {
        super(UserSettingsDao)
    }

    loadByUserId(userId){
        return this.dao.loadByUserId(userId);
    }
}

