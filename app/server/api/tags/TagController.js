import { App, BaseController, JsonResponse, KnexConnector } from "lisco";
import expressAsyncHandler from "express-async-handler";
import { TagService } from ".";
import { IntegrationService } from "../integration";

export class TagController extends BaseController {
    configure() {
        this.router.post(
            `/tag/list/tags`,
            expressAsyncHandler((request, response, next) => {
                this.listTags(request, response, next);
            })
        );
        this.router.post(
            `/tag/list/messages`,
            expressAsyncHandler((request, response, next) => {
                this.listMessagesTagged(request, response, next);
            })
        );

        this.router.get(
            `/tag/:id/healthcheck`,
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
    async listTags(request, response, next) {
        try {
            let service = new TagService();
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
    async listMessagesTagged(request, response, next) {
        try {
            let service = new TagService();
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

            let data = await service.listMessagesTagged(filters, filters.start, filters.limit, checkedNodes);
            let jsRes = new JsonResponse(true, data.data, null, data.total);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    async healthcheck(request, response, next) {
        try {
            const service = new TagService();

            const data = await service.healthcheck(request.params.id);

            response.json(new JsonResponse(true, data));
        } catch (ex) {
            next(ex);
        }
    }
}
