import { BaseController } from "lisco";
import { MessageService } from ".";
import expressAsyncHandler from "express-async-handler";

export class MessageController extends BaseController {
    dao = new MessageService();

    configure() {
        this.router.get(
            `/messages/:channel`,
            expressAsyncHandler((request, response, next) => {
                this.getChannelMessages(request, response, next);
            })
        );

        /*   // Obtiene  el número de mensajes del canal indicado
        this.router.get(
            `/messages/:channel/count`,
            expressAsyncHandler((request, response, next) => {
                this.getChannelMessageCount(request, response, next);
            })
        ); */

        return this.router;
    }

    async getChannelMessages(req, res, next) {
        const channel = req.params.channel;

        try {
            const data = await this.dao.getChannelMessages(channel, 10, 1);
            console.log(data.body);
            res.json(data.body);
        } catch (e) {
            if (e.body.status === 404) {
                res.json({});
            } else {
                next(e);
            }
        }
    }
}
