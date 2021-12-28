import expressAsyncHandler from "express-async-handler";
import { BaseController, JsonResponse } from "lisco";
import { JUMAgentService } from ".";

export class JUMAgentController extends BaseController {
    configure() {
        super.configure("jum_agent", { service: JUMAgentService });

        //Start agentListening
        const service = new JUMAgentService();
        service.listenForAgents();

        this.router.put(
            "/jum_agent/:id/approve",
            expressAsyncHandler((req, res, next) => {
                this.approveAgent(req, res, next);
            })
        );
        this.router.get(
            "/jum_agent/:id/log",
            expressAsyncHandler((req, res, next) => {
                this.agentLog(req, res, next);
            })
        );

        return this.router;
    }

    async approveAgent(request, response, next) {
        try {
            const service = new JUMAgentService();

            await service.approveAgent(request.params.id);

            response.json(new JsonResponse(true));
        } catch (ex) {
            next(ex);
        }
    }

    async agentLog(request, response, next) {
        try {
            const service = new JUMAgentService();

            const res = await service.sendCommand(request.params.id, "/agent/log");

            response.json(new JsonResponse(res.status, res.data));
        } catch (ex) {
            next(ex);
        }
    }
}
