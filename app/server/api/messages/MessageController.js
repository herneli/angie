import { BaseController, JsonResponse } from "lisco";

import expressAsyncHandler from "express-async-handler";
import axios from "axios";

export class MessageController extends BaseController {
    configure() {
        this.router.get(
            `/messages/:channel`,
            expressAsyncHandler((request, response, next) => {
                this.getChannelMessages(request, response, next);
            })
        );

        return this.router;
    }

    async getChannelMessages(req, res, next) {
        const channel = req.params.channel;
        //TODO: "No hardcodear URL Elastic"
        try {
            const elasticResponse = await axios.get(`http://localhost:3103/stats_${channel}/_search`);
            res.json(elasticResponse.data);
        } catch (e) {
            next(e);
        }
    }
}
