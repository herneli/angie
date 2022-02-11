import { App, BaseController, JsonResponse } from "lisco";
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
                this.getChannelMessages(request, response, next);
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

    async getChannelMessages(req, res, next) {
        const channel = req.params.channel;
        const filters = req.body;
        try {
            const data = await this.service.getChannelMessages(channel, filters);
            res.json(data);
        } catch (e) {
            if (e.body.status === 404) {
                res.json({});
            } else {
                next(e);
            }
        }
    }

    async getChannelMessageCount(req, res, next) {
        const channel = req.params.channel;

        try {
            const data = await this.service.getChannelMessageCount(channel);
            res.json(data.body);
        } catch (e) {
            if (e.body.status === 404) {
                res.json({});
            } else {
                next(e);
            }
        }
    }

    async getMessageTraces(req, res, next) {
        const { channel, message } = req.params;
        try {
            const data = await this.service.getMessageTraces(channel, message);
            console.log(data);
            res.json(data);
        } catch (e) {
            next(e);
        }
    }
}
