import { Utils, BaseService } from 'lisco';
import { IntegrationChannelDao, IntegrationChannelService } from '../integration_channel';
import { IntegrationDao } from './IntegrationDao';
import lodash from 'lodash';

export class IntegrationService extends BaseService {

    constructor() {
        super(IntegrationDao)

        this.channelService = new IntegrationChannelService();
    }

    /**
     * Obtencion de un elemento mediante su identificador
     */
    //Overwrite
    async loadById(id) {
        const integration = await this.dao.loadById(id);
        const { data: channels } = await this.channelService.getIntegrationChannels(integration[0].id)
        integration[0].channels = channels;

        return integration;
    }


    async integrationsWithChannels(filters, start, limit) {
        //Pagination
        start = start || 0;
        limit = limit || 1000;//Default limit
        let response = {};
        response.total = await this.dao.countFilteredData(filters, start, limit);
        const integrations = await super.list(filters, start, limit);

        const { data: channels } = await this.channelService.list();

        const grouped = lodash.groupBy(channels, 'integration_id');


        response.data = lodash.map(integrations.data, (int) => {
            if (grouped[int.id]) {
                int.channels = grouped[int.id];
            }
            return int;
        })

        return response;
    }


    async deployIntegration(identifier) {
        const response = await this.channelService.getIntegrationChannels(identifier);

        for (const channel of response.data) {
            //TODO deploy
            try {
                let camelRoute = await this.convertChannelToCamel(channel);
                channel.status = 'DEPLOYED';
            } catch (e) {
                console.error(e);
                channel.status = 'CONVERSION_ERROR';
            }
        }

        return response;
    }

    async undeployIntegration(identifier) {
        const response = await this.channelService.getIntegrationChannels(identifier);


        for (let channel of response.data) {
            //TODO deploy
            channel.status = 'UNDEPLOYED';
        }

        return response;
    }



}

