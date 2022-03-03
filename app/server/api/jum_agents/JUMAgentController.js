import expressAsyncHandler from "express-async-handler";
import { BaseController, JsonResponse } from "lisco";
import { JUMAgentService } from ".";
import { IntegrationService } from "../integration";

export class JUMAgentController extends BaseController {
    configure() {
        super.configure("jum_agent", { service: JUMAgentService });


        this.router.get(
            "/jum_agent/list/scrape",
            expressAsyncHandler((req, res, next) => {
                this.listToScrap(req, res, next);
            })
        );
        this.router.put(
            "/jum_agent/:id/approve",
            expressAsyncHandler((req, res, next) => {
                this.approveAgent(req, res, next);
            })
        );
        this.router.post(
            "/jum_agent/:id/forceReload",
            expressAsyncHandler((req, res, next) => {
                this.forceReload(req, res, next);
            })
        );
        this.router.get(
            "/jum_agent/:id/log",
            expressAsyncHandler((req, res, next) => {
                this.agentLog(req, res, next);
            })
        );

        this.router.post(
            "/jum_agent/:id/reload_dependencies",
            expressAsyncHandler((req, res, next) => {
                this.reloadDependencies(req, res, next);
            })
        );

        this.router.get(
            "/jum_agent/:id/get_dependencies",
            expressAsyncHandler((req, res, next) => {
                this.getDependencies(req, res, next);
            })
        );

        this.router.post(
            "/jum_agent/resend",
            expressAsyncHandler((req, res, next) => {
                this.resendMessage(req, res, next);
            })
        );

        return this.router;
    }

    async listToScrap(request, response, next) {
        try {
            let service = new this.service();
            let data = await service.listToScrap();
            response.json(data);
        } catch (e) {
            next(e);
        }
    }

    async forceReload(request, response, next) {
        try {
            const service = new JUMAgentService();
            const agent = await service.loadById(request.params.id);

            await service.loadAgentStatus(agent);

            response.json(new JsonResponse(true));
        } catch (ex) {
            next(ex);
        }
    }


    async reloadDependencies(request, response, next) {
        try {
            const service = new JUMAgentService();
            const agent = await service.loadById(request.params.id);

            await service.reloadDependencies(agent);

            response.json(new JsonResponse(true));
        } catch (ex) {
            next(ex);
        }
    }

    async getDependencies(request, response, next) {
        try {
            const service = new JUMAgentService();
            const agent = await service.loadById(request.params.id);

            const res = await service.getAgentDependencies(agent);

            
            response.json(new JsonResponse(true,res));
        } catch (ex) {
            next(ex);
        }
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

    async resendMessage(request, response, next) {
        try {
            const service = new JUMAgentService();
            let jum_agent = await service.getChannelCurrentAgent(request.body.channel)
            delete request.body.integration;
            let params = request.body


            const res = await service.sendCommand(jum_agent.id, "/channel/resend", params);

            response.json(new JsonResponse(res.status, res.data));
        } catch (ex) {
            next(ex);
        }
    }
}
