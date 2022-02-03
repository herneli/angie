import { BaseController, JsonResponse } from "lisco";
import expressAsyncHandler from "express-async-handler";
import { TagService } from ".";

export class TagController extends BaseController {
    configure() {
        this.router.post(
            `/tag/list`,
            expressAsyncHandler((request, response, next) => {
                this.listEntity(request, response, next);
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
            let service = new TagService();
            let filters =
                request.method === "POST"
                    ? request.body
                    : request.query && request.query.filters
                    ? JSON.parse(request.query.filters)
                    : {};

            let data = await service.list(filters, filters.start, filters.limit);
            let jsRes = new JsonResponse(true, data.data, null, data.total);

            response.json(jsRes.toJson());
        } catch (e) {
            next(e);
        }
    }
}
