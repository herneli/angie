import { Utils, BaseService } from 'lisco';
import { IntegrationChannelDao } from './IntegrationChannelDao';


export class IntegrationChannelService extends BaseService {

    constructor() {
        super(IntegrationChannelDao)
    }

}

