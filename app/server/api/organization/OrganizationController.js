import { BaseController, JsonResponse } from 'lisco';
import lodash from 'lodash';
import { OrganizationService } from './OrganizationService';


export class OrganizationController extends BaseController {

    configure() {
        super.configure('organization', { service: OrganizationService });
        return this.router;
    }


}
