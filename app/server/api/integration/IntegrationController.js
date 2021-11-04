import { BaseController, JsonResponse } from "lisco";
import lodash from "lodash";
import { IntegrationService } from "./IntegrationService";

const asyncHandler = require("express-async-handler");

export class IntegrationController extends BaseController {
    configure() {
        super.configure("integration", { service: IntegrationService });

        this.router.get(
            `/integration/list/full`,
            asyncHandler((request, response, next) => {
                this.integrationsWithChannels(request, response, next);
            })
        );
        this.router.post(
            `/integration/list/full`,
            asyncHandler((request, response, next) => {
                this.integrationsWithChannels(request, response, next);
            })
        );

        this.router.post(
            `/integration/full`,
            asyncHandler((request, response, next) => {
                this.saveFullIntegration(request, response, next);
            })
        );

        this.router.post(
            `/integration/:id/deploy`,
            asyncHandler((request, response, next) => {
                this.deployIntegration(request, response, next);
            })
        );
        this.router.post(
            `/integration/:id/undeploy`,
            asyncHandler((request, response, next) => {
                this.undeployIntegration(request, response, next);
            })
        );
        this.router.get(
            `/integration/:id/channels/status`,
            asyncHandler((request, response, next) => {
                this.integrationChannelStatuses(request, response, next);
            })
        );

        return this.router;
    }

    async integrationsWithChannels(request, response, next) {
        try {
            let service = new IntegrationService();
            let filters = request.method === "POST" ? request.body : request.query;

            let data = await service.integrationsWithChannels(filters, filters.start, filters.limit);
            let jsRes = new JsonResponse(true, data.data, null, data.total);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async saveFullIntegration(request, response, next) {
        try {
            let service = new IntegrationService();

            let data = await service.saveFullIntegration(request.body);
            let jsRes = new JsonResponse(true, data, null, 1);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async deployIntegration(request, response, next) {
        try {
            let service = new IntegrationService();
            let identifier = request.params.id;

            let res = await service.deployIntegration(identifier);
            let jsRes = new JsonResponse(true, res.data, null, res.total);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async undeployIntegration(request, response, next) {
        try {
            let service = new IntegrationService();
            let identifier = request.params.id;

            let res = await service.undeployIntegration(identifier);
            let jsRes = new JsonResponse(true, res.data, null, res.total);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async integrationChannelStatuses(request, response, next) {
        try {
            let service = new IntegrationService();
            let identifier = request.params.id;

            let res = await service.integrationChannelStatuses(identifier);
            let jsRes = new JsonResponse(true, res, null);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }
}
