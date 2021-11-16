import { Utils, BaseService } from 'lisco';
import { ProfileDao } from './ProfileDao';


export class ProfileService extends BaseService {

    constructor() {
        super(ProfileDao)
    }

    
}

