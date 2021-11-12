import { App, BaseService } from "lisco";
import { IntegrationChannelService } from "../integration_channel";
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

    //Overwrite
    async loadById(id) {
        const [integration] = await super.loadById(id);

        if (integration.data.channels) {
            for (let channel of integration.data.channels) {
                channel = await this.channelService.channelObjStatus(channel);
            }
        }
        return [integration];
    }

    //Overwrite
    async save(body) {
        let entity = {
            name: body.name,
            enabled: body.enabled,
            organization_id: body.organization_id,
            data: body,
        };

        const res = await super.save(entity);
        App.events.emit("integration_saved", { body });
        return res;
    }

    //Overwrite
    async update(id, body) {
        let entity = {
            id: id,
            name: body.name,
            enabled: body.enabled,
            organization_id: body.organization_id,
            data: body,
        };
        const res = await super.update(id, entity);
        App.events.emit("integration_updated", { body });
        return res;
    }

    //Overwrite
    async delete(id) {
        const res = await super.delete(id);
        App.events.emit("integration_deleted", { body: { id } });
        return res;
    }

    //Overwrite
    async list(filters, start, limit) {
        if (!filters) {
            filters = {};
        }
        filters.sort = { field: "name", direction: "ascend" };

        let { data, total } = await super.list(filters, start, limit);

        for (const integration of data) {
            if (integration.data.channels) {
                for (let channel of integration.data.channels) {
                    channel = await this.channelService.channelObjStatus(channel);
                }
            }
        }

        return { data, total };
    }

    async integrationChannelStatuses(identifier) {
        const [integration] = await this.loadById(identifier);
        if (!integration) {
            throw "Integration does not exist";
        }

        let response = {};
        for (let channel of integration.data.channels) {
            let channStatus;
            try {
                channStatus = await this.jumDao.getRouteStatus(channel.id);
            } catch (ex) {
                console.error(ex);
            }
            response[channel.id] = (channStatus && channStatus.status) || "UNDEPLOYED";
        }

        return response;
    }

    async deployIntegration(identifier) {
        const [integration] = await this.loadById(identifier);
        if (!integration) {
            throw "Integration does not exist";
        }

        for (const channel of integration.data.channels) {
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
        const [integration] = await this.loadById(identifier);
        if (!integration) {
            throw "Integration does not exist";
        }

        for (const channel of integration.data.channels) {
            const response = await this.jumDao.undeployRoute(channel.id);
            console.log(response);
            channel.status = "UNDEPLOYED";
        }

        return response;
    }
}
