import { BaseController, JsonResponse } from 'lisco';
import lodash from 'lodash';
import { IntegrationService } from './IntegrationService';

const asyncHandler = require('express-async-handler')

export class IntegrationController extends BaseController {

    configure() {
        super.configure('integration', { service: IntegrationService });
        return this.router;
    }


}
