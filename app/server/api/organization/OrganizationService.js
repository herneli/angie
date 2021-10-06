import { Utils, BaseService } from 'lisco';
import { OrganizationDao } from './OrganizationDao';


export class OrganizationService extends BaseService {

    constructor() {
        super(OrganizationDao)
    }

}

