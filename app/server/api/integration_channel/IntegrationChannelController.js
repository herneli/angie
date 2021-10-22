import { BaseController, JsonResponse } from 'lisco';
import lodash from 'lodash';
import { IntegrationChannelService } from './IntegrationChannelService';

const asyncHandler = require('express-async-handler')

export class IntegrationChannelController extends BaseController {

    configure() {
        super.configure('integration_channel', { service: IntegrationChannelService });


        this.router.post(`/integration_channel/:id/deploy`, asyncHandler((request, response, next) => { this.deployChannel(request, response, next); }));
        this.router.post(`/integration_channel/:id/undeploy`, asyncHandler((request, response, next) => { this.undeployChannel(request, response, next); }));


        this.router.post(`/integration_channel/:id/logs`, asyncHandler((request, response, next) => { this.channelLogs(request, response, next); }));
        this.router.post(`/integration_channel/:id/statistics`, asyncHandler((request, response, next) => { this.channelStats(request, response, next); }));

        return this.router;
    }




    async deployChannel(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let identifier = request.params.id;

            let res = await service.deployChannel(identifier);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async undeployChannel(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let identifier = request.params.id;

            let res = await service.undeployChannel(identifier);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async channelLogs(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let identifier = request.params.id;

            let res = await service.channelLogs(identifier);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }
    
    async channelStats(request, response, next) {
        try {
            let service = new IntegrationChannelService();
            let identifier = request.params.id;

            let res = await service.channelStats(identifier);
            let jsRes = new JsonResponse(true, res, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

}
