import { App, BaseController, JsonResponse } from "lisco";
import expressAsyncHandler from "express-async-handler";
import { EntityService } from ".";

export class EntityController extends BaseController {
    configure() {
        this.router.post(
            `/entity/list`,
            expressAsyncHandler((request, response, next) => {
                this.listEntity(request, response, next);
            })
        );

        this.router.get(
            `/entity/:id`,
            expressAsyncHandler((request, response, next) => {
                this.getEntity(request, response, next);
            })
        );

        return this.router;
    }

    /**
     * Lista entidades en la aplicacion, es posible enviarle parametros de filtrado.
     *
     */
    async listEntity(request, response, next) {
        try {
            let service = new EntityService();
            let filters =
                request.method === "POST"
                    ? request.body
                    : request.query && request.query.filters
                    ? JSON.parse(request.query.filters)
                    : {};
            const organizationFilter = await App.Utils.getOrganizationFilter(request);

            //Filtrar en base a la organización del usuario
            if (organizationFilter !== "all") {
                filters["organization.keyword"] = {
                    type: "termsi",
                    value: organizationFilter,
                };
            }
            let data = await service.list(filters, filters.start, filters.limit);
            let jsRes = new JsonResponse(true, data.data, null, data.total);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }

    /**
     *
     * @param {*} request
     * @param {*} response
     * @param {*} next
     */
    async getEntity(request, response, next) {
        try {
            let service = new EntityService();
            const msg_filters = request.query && request.query.msg_filters ? JSON.parse(request.query.msg_filters) : {};

            let data = await service.loadById(request.params.id, msg_filters);
            let jsRes = new JsonResponse(true, data);
            let code = 200;
            if (data == null) {
                code = 404;
                let message = "Element not found";
                jsRes = new JsonResponse(false, null, message, 0);
            }

            response.status(code).json(jsRes.toJson());
        } catch (e) {
            console.error(e);
            let message = "";
            if (e.code == "22P02") {
                //PostgreSQL error Code form string_to_UUID
                message = "Expected uiid";
            }
            let jsRes = new JsonResponse(false, null, message, 0);
            response.status(400).json(jsRes.toJson());
        }
    }
}
