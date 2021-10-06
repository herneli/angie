import { BaseController, JsonResponse } from 'lisco';
import lodash from 'lodash';
import { CamelComponentService } from './CamelComponentService';

const asyncHandler = require('express-async-handler')

export class CamelComponentController extends BaseController {

    configure() {
        super.configure('camel_component', { service: CamelComponentService });
        return this.router;
    }


}
