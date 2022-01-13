import { App, BaseController, JsonResponse } from "lisco";
import lodash from "lodash";
import { IntegrationService } from "./IntegrationService";

import expressAsyncHandler from "express-async-handler";
import Utils from "../../common/Utils";
import { UserService } from "../user";

export class IntegrationController extends BaseController {
    configure() {
        super.configure("integration", { service: IntegrationService });

        this.router.post(
            `/integration/list/deployed`,
            expressAsyncHandler((request, response, next) => {
                this.listDeployedIntegrations(request, response, next);
            })
        );

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

    async listDeployedIntegrations(request, response, next) {
        try {
            let service = new this.service();
            let filters =
                request.method === "POST"
                    ? request.body
                    : request.query && request.query.filters
                    ? JSON.parse(request.query.filters)
                    : {};

            const username = App.Utils.getUsername(request);

            const userServ = new UserService();
            const user = await userServ.loadByUsername(username);
            if (!user) {
                let jsRes = new JsonResponse(true, []);
                return response.json(jsRes.toJson());
            }
            //Filtrar en base a la organización del usuario
            if (user.data.current_organization && user.data.current_organization !== "all") {
                filters["organization_id"] = {
                    type: "in",
                    value:
                        user.data.current_organization === "assigned"
                            ? user.data.organization_id
                            : user.data.current_organization,
                };
            }

            let data = await service.list(filters, filters.start, filters.limit);
            let jsRes = new JsonResponse(true, data.data, null, data.total);

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
