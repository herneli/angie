import { BaseController, JsonResponse } from "lisco";
import lodash from "lodash";
import { IntegrationChannelService } from "./IntegrationChannelService";
import { App } from "lisco";
import axios from "axios";

import expressAsyncHandler from "express-async-handler";

export class IntegrationChannelController extends BaseController {
    configure() {
        this.router.post(
            `/integration/:id/channel/:channel/deploy`,
            expressAsyncHandler((request, response, next) => {
                this.deployChannel(request, response, next);
            })
        );
        this.router.post(
            `/integration/:id/channel/:channel/move/`,
            expressAsyncHandler((request, response, next) => {
                this.moveChannel(request, response, next);
            })
        );
        this.router.post(
            `/integration/:id/channel/:channel/move/:agent`,
            expressAsyncHandler((request, response, next) => {
                this.moveChannel(request, response, next);
            })
        );
        this.router.post(
            `/integration/:id/channel/:channel/undeploy`,
            expressAsyncHandler((request, response, next) => {
                this.undeployChannel(request, response, next);
            })
        );
        this.router.get(
            `/integration/:id/channel/:channel`,
            expressAsyncHandler((request, response, next) => {
                this.getChannelById(request, response, next);
            })
        );
        this.router.get(
            `/integration/:id/channel/:channel/status`,
            expressAsyncHandler((request, response, next) => {
                this.channelStatus(request, response, next);
            })
        );
        this.router.get(
            `/integration/:id/channel/:channel/log`,
            expressAsyncHandler((request, response, next) => {
                this.channelLogs(request, response, next);
            })
        );
        this.router.post(
            `/integration_channel/to_camel`,
            expressAsyncHandler((request, response, next) => {
                this.convertToCamel(request, response, next);
            })
        );
        this.router.post(
            `/integration_channel/to_camel/specific_node`,
            expressAsyncHandler((request, response, next) => {
                this.convertNodeToCamel(request, response, next);
            })
        );

        this.router.post(
            `/channel/:id/sendMessageToRoute`,
            expressAsyncHandler((request, response, next) => {
                this.sendMessageToRoute(request, response, next);
            })
        );
        this.router.get(
            `/channel/all_by_integration`,
            expressAsyncHandler((request, response, next) => {
                this.getAllChannelsByIntegration(request, response, next);
            })
        );
        this.router.get(
            `/channel/all`,
            expressAsyncHandler((request, response, next) => {
                this.getAllChannels(request, response, next);
            })
        );
        return this.router;
    }

    async deployChannel(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let integration = request.params.id;
            let channel = request.params.channel;

            let res = await service.deployChannel(integration, channel);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async moveChannel(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let integration = request.params.id;
            let channel = request.params.channel;
            let currentAgent = request.params.agent;

            let res = await service.moveChannel(integration, channel, currentAgent);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async undeployChannel(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let integration = request.params.id;
            let channel = request.params.channel;

            let res = await service.undeployChannel(integration, channel);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async channelStatus(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let integration = request.params.id;
            let channel = request.params.channel;

            let res = await service.channelStatus(integration, channel);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async getChannelById(request, response, next) {
        try {
            const service = new IntegrationChannelService();
            const channel = request.params.channel;

            const res = await service.getChannelById(channel);
            const jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async channelLogs(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let integration = request.params.id;
            let channel = request.params.channel;

            let res = await service.channelLogs(integration, channel);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async convertToCamel(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let channel = request.body.channel;

            let res = await service.convertChannelToCamel(channel);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async convertNodeToCamel(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let node = request.body.node_type;
            let data = request.body.data;

            let res = await service.convertNodeTypeToCamel(node, data);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async sendMessageToRoute(request, response, next) {
        try {
            let service = new IntegrationChannelService();

            const { endpoint, content } = request.body;
            const channelId = request.params.id;

            await service.sendMessageToRoute(channelId, endpoint, content);

            response.status(200).end();
        } catch (e) {
            next(e);
        }
    }

    async getAllChannelsByIntegration(request, response, next) {
        try {
            let service = new IntegrationChannelService();

            let res = await service.listAllChannelsByIntegration();
            const jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());

            response.status(200).end();
        } catch (e) {
            next(e);
        }
    }

    async getAllChannels(request, response, next) {
        try {
            let service = new IntegrationChannelService();

            let res = await service.listAllChannels();
            const jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());

            response.status(200).end();
        } catch (e) {
            next(e);
        }
    }
}
