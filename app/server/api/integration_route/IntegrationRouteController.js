import { BaseController, JsonResponse } from 'lisco';
import lodash from 'lodash';
import { IntegrationRouteService } from './IntegrationRouteService';

const asyncHandler = require('express-async-handler')

export class IntegrationRouteController extends BaseController {

    configure() {
        super.configure('integration_route', { service: IntegrationService });
        return this.router;
    }


}
