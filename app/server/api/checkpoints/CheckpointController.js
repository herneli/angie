import { App, BaseController, JsonResponse, KnexConnector } from "lisco";
import expressAsyncHandler from "express-async-handler";
import { CheckpointService } from ".";
import { IntegrationService } from "../integration";

export class CheckpointController extends BaseController {
    configure() {
        this.router.post(
            `/checkpoint/list/checkpoints`,
            expressAsyncHandler((request, response, next) => {
                this.listCheckpoints(request, response, next);
            })
        );
        this.router.post(
            `/checkpoint/list/messages`,
            expressAsyncHandler((request, response, next) => {
                this.listMessagesCheckpointed(request, response, next);
            })
        );

        this.router.get(
            `/checkpoint/:id/healthcheck`,
            expressAsyncHandler((request, response, next) => {
                this.healthcheck(request, response, next);
            })
        );

        setInterval(async () => {
            //Establecer el intervalo de recarga de la vista de tagged_messages
            const knex = KnexConnector.connection;
            await knex.raw("REFRESH MATERIALIZED VIEW tagged_messages;");
            console.log("reloading tagged_messages");
        }, 30 * 1000);

        return this.router;
    }

    /**
     * Lista entidades en la aplicacion, es posible enviarle parametros de filtrado.
     *
     */
    async listCheckpoints(request, response, next) {
        try {
            let service = new CheckpointService();
            let { checkedNodes, filters } = request.body;

            if (!filters) {
                filters = {};
            }
            const integService = new IntegrationService();
            const organizationFilter = await App.Utils.getOrganizationFilter(request);
            if (organizationFilter !== "all") {
                filters["channel_id"] = {
                    type: "in",
                    value: await integService.getChannelIdsByOrganization(organizationFilter),
                };
            }

            let data = await service.list(filters, filters.start, filters.limit, checkedNodes);
            let jsRes = new JsonResponse(true, data.data, null, data.total);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    /**
     * Lista entidades en la aplicacion, es posible enviarle parametros de filtrado.
     *
     */
    async listMessagesCheckpointed(request, response, next) {
        try {
            let service = new CheckpointService();
            let { checkedNodes, filters } = request.body;

            if (!filters) {
                filters = {};
            }
            const integService = new IntegrationService();
            const organizationFilter = await App.Utils.getOrganizationFilter(request);
            if (organizationFilter !== "all") {
                filters["channel_id"] = {
                    type: "in",
                    value: await integService.getChannelIdsByOrganization(organizationFilter),
                };
            }

            let data = await service.listMessagesCheckpointed(filters, filters.start, filters.limit, checkedNodes);
            let jsRes = new JsonResponse(true, data.data, null, data.total);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async healthcheck(request, response, next) {
        try {
            const service = new CheckpointService();

            const data = await service.healthcheck(request.params.id);

            response.json(new JsonResponse(true, data));
        } catch (ex) {
            next(ex);
        }
    }
}
