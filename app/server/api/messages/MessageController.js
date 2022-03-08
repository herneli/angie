import { BaseController, JsonResponse, KnexConnector } from "lisco";
import { MessageService } from ".";
import expressAsyncHandler from "express-async-handler";

export class MessageController extends BaseController {
    service = new MessageService();

    configure() {
        this.router.post(
            `/messages/list`,
            expressAsyncHandler((request, response, next) => {
                this.listMessages(request, response, next);
            })
        );
        this.router.post(
            `/messages/:channel`,
            expressAsyncHandler((request, response, next) => {
                this.listMessages(request, response, next);
            })
        );

        // Obtiene  el número de mensajes del canal indicado
        this.router.get(
            `/messages/:channel/count`,
            expressAsyncHandler((request, response, next) => {
                this.getChannelMessageCount(request, response, next);
            })
        );

        this.router.get(
            `/messages/:channel/traces/:message`,
            expressAsyncHandler((request, response, next) => {
                this.getMessageTraces(request, response, next);
            })
        );

        setInterval(async () => {
            //TODO: Añadir intervalo de recarga personalizado en la (futura) vista de control de tareas programaddas
            const knex = KnexConnector.connection;
            await knex.raw("REFRESH MATERIALIZED VIEW message_counts;");
            // console.log("Reloading message_counts");
        }, 30 * 1000);

        return this.router;
    }

    async listMessages(request, response, next) {
        try {
            let service = new MessageService();
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

    async getChannelMessageCount(req, res, next) {
        const channel = req.params.channel;

        try {
            const data = await this.service.getChannelMessageCount(channel);
            res.json(data.body);
        } catch (e) {
            next(e);
        }
    }

    async getMessageTraces(req, res, next) {
        const { channel, message } = req.params;
        try {
            const data = await this.service.getMessageTraces(channel, message);
            // console.log(data);
            res.json(data);
        } catch (e) {
            next(e);
        }
    }
}
