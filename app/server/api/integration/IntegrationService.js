import { App, BaseService } from "lisco";
import { IntegrationChannelService } from "../integration_channel";
import { IntegrationDao } from "./IntegrationDao";
import { JumDao } from "../../integration/jum-angie";
import { ScriptService } from "../script/ScriptService";

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

    async applyBeforeSave(action, node) {
        switch (action) {
            case "generateCode":
                let scriptService = new ScriptService();
                let code = await scriptService.generateCode(node.data.script);
                return {
                    ...node,
                    data: {
                        ...node.data,
                        code: code,
                    },
                };
            default:
                return node;
        }
    }

    async completeBeforeSave(body) {
        let completedChannels = [];
        for (const channel of body.channels) {
            let nodes = [];
            if (channel.nodes) {
                if (channel.nodes.list) {
                    channel.nodes = channel.nodes.list; //FIXME: Quitar en una temporada, sirve para mantener compatibilidad con versiones previas de las integraciones
                }
                for (const node of channel.nodes) {
                    if (node.data.beforeSave) {
                        let completedNode = await this.applyBeforeSave(node.data.beforeSave, node);
                        nodes.push(completedNode);
                    } else {
                        nodes.push(node);
                    }
                }
            }
            completedChannels.push({ ...channel, nodes: nodes });
        }
        return {
            ...body,
            channels: completedChannels,
        };
    }

    //Overwrite
    async save(body) {
        let integrationData = await this.completeBeforeSave(body);
        let entity = {
            name: integrationData.name,
            enabled: integrationData.enabled,
            organization_id: integrationData.organization_id,
            data: integrationData,
        };

        const res = await super.save(entity);
        App.events.emit("integration_saved", { integrationData });
        return res;
    }

    //Overwrite
    async update(id, body) {
        let integrationData = await this.completeBeforeSave(body);
        let entity = {
            id: id,
            name: integrationData.name,
            enabled: integrationData.enabled,
            organization_id: integrationData.organization_id,
            data: integrationData,
        };
        const res = await super.update(id, entity);
        App.events.emit("integration_updated", { integrationData });
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
        if (!filters.sort) {
            filters.sort = { field: "name", direction: "ascend" };
        }

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
