import { App, BaseController, JsonResponse } from "lisco";
import lodash from "lodash";
import { IntegrationService } from "./IntegrationService";

import expressAsyncHandler from "express-async-handler";

export class IntegrationController extends BaseController {
    configure() {
        super.configure("integration", { service: IntegrationService });

        this.router.post(
            `/integration/:id/deploy`,
            expressAsyncHandler((request, response, next) => {
                this.deployIntegration(request, response, next);
            })
        );
        this.router.post(
            `/integration/:id/undeploy`,
            expressAsyncHandler((request, response, next) => {
                this.undeployIntegration(request, response, next);
            })
        );
        this.router.get(
            `/integration/:id/channels/status`,
            expressAsyncHandler((request, response, next) => {
                this.integrationChannelStatuses(request, response, next);
            })
        );

        return this.router;
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
