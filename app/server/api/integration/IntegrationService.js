import { App, BaseService } from "lisco";
import { IntegrationChannelService } from "../integration_channel";
import { IntegrationDao } from "./IntegrationDao";
import { ScriptService } from "../script/ScriptService";

import { JUMAgentService } from "../jum_agents";
export class IntegrationService extends BaseService {
    constructor() {
        super(IntegrationDao);

        this.channelService = new IntegrationChannelService();
        this.agentService = new JUMAgentService();
    }

    //Overwrite
    async loadById(id) {
        const integration = await super.loadById(id);
        
        integration.data.deployment_config = integration.deployment_config;

        if (integration && integration.data && integration.data.channels) {
            for (let channel of integration.data.channels) {
                const channelState = await this.agentService.getChannelCurrentState(channel.id);
                channel = this.channelService.channelApplyStatus(channel, channelState);
            }
        }
        return integration;
    }

    async applyBeforeSave(action, node, integration) {
        switch (action) {
            case "generateCode":
                let scriptService = new ScriptService();
                console.log("Integration", integration);
                let code = await scriptService.generateCode(
                    node.data.script,
                    integration.package_code,
                    integration.package_version
                );
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
        if (body.channels) {
            for (const channel of body.channels) {
                let nodes = [];
                if (channel.nodes) {
                    if (channel.nodes.list) {
                        channel.nodes = channel.nodes.list; //FIXME: Quitar en una temporada, sirve para mantener compatibilidad con versiones previas de las integraciones
                    }
                    for (const node of channel.nodes) {
                        if (node.data.beforeSave) {
                            let completedNode = await this.applyBeforeSave(node.data.beforeSave, node, body);
                            nodes.push(completedNode);
                        } else {
                            nodes.push(node);
                        }
                    }
                    completedChannels.push({ ...channel, nodes: nodes });
                }
            }
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
            package_code: integrationData.package_code,
            package_version: integrationData.package_version,
            data: integrationData,
            deployment_config: integrationData.deployment_config,
        };
        delete entity.data.deployment_config;

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
            package_code: integrationData.package_code,
            package_version: integrationData.package_version,
            data: integrationData,
            deployment_config: integrationData.deployment_config,
        };
        delete entity.data.deployment_config;

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
            integration.data.deployment_config = integration.deployment_config;

            if (integration.data.channels) {
                for (let channel of integration.data.channels) {
                    const channelState = await this.agentService.getChannelCurrentState(channel.id);
                    channel = await this.channelService.channelApplyStatus(channel, channelState);
                }
            }
        }

        return { data, total };
    }

    async integrationChannelStatuses(identifier) {
        const integration = await this.loadById(identifier);
        if (!integration) {
            throw "Integration does not exist";
        }

        let response = {};
        
        for (let channel of integration.data.channels) {
            response[channel.id] = channel.status;
        }

        return response;
    }

    async deployIntegration(identifier) {
        const integration = await this.loadById(identifier);
        if (!integration) {
            throw "Integration does not exist";
        }

        for (const channel of integration.data.channels) {
            try {
                const response = await this.channelService.performDeploy(channel);
                // console.log(response);
                channel.status = response && response.status;
            } catch (e) {
                console.error(e);
                channel.status = "CONVERSION_ERROR";
            }
        }

        return integration;
    }

    async undeployIntegration(identifier) {
        const integration = await this.loadById(identifier);
        if (!integration) {
            throw "Integration does not exist";
        }

        for (const channel of integration.data.channels) {
            const response = await this.channelService.performUndeploy(channel);
            console.log(response);
            channel.status = "UNDEPLOYED";
        }

        return integration;
    }
}
