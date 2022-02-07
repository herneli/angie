import client from "prom-client";
import { BaseController, JsonResponse } from "lisco";
import expressAsyncHandler from "express-async-handler";

export class MetricsController extends BaseController {
    constructor() {
        super();
        // Create a Registry which registers the metrics
        const register = new client.Registry()

        // Add a default label which is added to all metrics
        register.setDefaultLabels({
            app: 'angie'
        })

        // Enable the collection of default metrics
        client.collectDefaultMetrics({ register });

        this.register = register;
    }

    configure() {
        this.router.get(
            `/metrics`,
            expressAsyncHandler((request, response, next) => {
                this.getMetrics(request, response, next);
            })
        );

        return this.router;
    }

    async getMetrics(request, response, next) {
        try {
            let data = await this.register.metrics()
            response.send(data);
        } catch (ex) {
            next(ex);
        }
    }
}