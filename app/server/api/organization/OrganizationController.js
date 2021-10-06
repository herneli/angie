import { BaseController, JsonResponse } from 'lisco';
import lodash from 'lodash';
import { OrganizationService } from './OrganizationService';

const asyncHandler = require('express-async-handler')

export class OrganizationController extends BaseController {

    configure() {
        super.configure('organization', { service: OrganizationService });
        return this.router;
    }


}
