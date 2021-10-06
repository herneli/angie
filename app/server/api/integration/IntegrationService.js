import { Utils, BaseService } from 'lisco';
import { IntegrationDao } from './IntegrationDao';


export class IntegrationService extends BaseService {

    constructor() {
        super(IntegrationDao)
    }

}

