import { Utils, BaseService } from 'lisco';
import LdapHostDao from './LdapHostDao';

export class LdapHostService extends BaseService {

    constructor() {
        super(LdapHostDao)
    }


}

