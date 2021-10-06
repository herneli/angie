import { Utils, BaseService } from 'lisco';
import { IntegrationRouteDao } from './IntegrationRouteDao';


export class IntegrationRouteService extends BaseService {

    constructor() {
        super(IntegrationRouteDao)
    }

}

