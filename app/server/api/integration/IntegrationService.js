import { Utils, BaseService } from "lisco";
import { IntegrationChannelDao, IntegrationChannelService } from "../integration_channel";
import { IntegrationDao } from "./IntegrationDao";
import lodash from "lodash";
import moment from "moment";

import { JumDao } from "../../integration/jum-angie";

export class IntegrationService extends BaseService {
    constructor() {
        super(IntegrationDao);

        this.channelService = new IntegrationChannelService();
        this.jumDao = new JumDao();
    }

    /**
     * Obtencion de un elemento mediante su identificador
     */
    //Overwrite
    async loadById(id) {
        const integration = await this.dao.loadById(id);
        const { data: channels } = await this.channelService.getIntegrationChannels(integration[0].id);
        integration[0].channels = channels;

        return integration;
    }

    async integrationsWithChannels(filters, start, limit) {
        //Pagination
        start = start || 0;
        limit = limit || 1000; //Default limit
        let response = {};
        response.total = await this.dao.countFilteredData(filters, start, limit);
        const { data: integrations } = await super.list(filters, start, limit);

        for (let integration of integrations) {
            const { data: channels } = await this.channelService.getIntegrationChannels(integration.id);
            integration.channels = channels;
        }
        response.data = integrations;

        return response;
    }

    async integrationChannelStatuses(identifier) {
        const { data: channels } = await this.channelService.getIntegrationChannels(identifier);

        let response = {};
        for (let channel of channels) {
            const channStatus = await this.jumDao.getRouteStatus(channel.id);

            response[channel.id] = (channStatus && channStatus.status) || "UNDEPLOYED";
        }

        return response;
    }

    async deployIntegration(identifier) {
        const response = await this.channelService.getIntegrationChannels(identifier);

        for (const channel of response.data) {
            try {
                let camelRoute = await this.channelService.convertChannelToCamel(channel);

                const response = await this.jumDao.deployRoute(channel.id, camelRoute);
                console.log(response);
                channel.status = "STARTED"; //TODO
            } catch (e) {
                console.error(e);
                channel.status = "CONVERSION_ERROR";
            }
        }

        return response;
    }

    async undeployIntegration(identifier) {
        const response = await this.channelService.getIntegrationChannels(identifier);

        for (let channel of response.data) {
            const response = await this.jumDao.undeployRoute(channel.id);
            console.log(response);
            channel.status = "UNDEPLOYED";
        }

        return response;
    }

    async saveFullIntegration(integration) {
        integration.last_updated = moment().toISOString();
        await this.saveOrUpdate(lodash.pick(integration, ["id", "created_on", "last_updated", "name", "description", "organization_id"]));

        for (let channel of integration.channels) {
            await this.channelService.saveOrUpdate({ ...channel });
        }
    }

    saveOrUpdate(elm) {
        return this.dao.saveOrUpdate(elm);
    }
}
