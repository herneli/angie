import { BaseController, JsonResponse } from 'lisco';
import lodash from 'lodash';
import { IntegrationChannelService } from './IntegrationChannelService';

const asyncHandler = require('express-async-handler')

export class IntegrationChannelController extends BaseController {

    configure() {
        super.configure('integration_route', { service: IntegrationChannelService });
        return this.router;
    }


}
