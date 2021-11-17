import { BaseController, JsonResponse } from "lisco";
import { ScriptDao } from "./ScriptDao";
import { KnexConnector } from "lisco";
import { ScriptService } from "./ScriptService";

import expressAsyncHandler from "express-async-handler";
export class ScriptController extends BaseController {
    configure() {
        this.router.get(
            "/script",
            expressAsyncHandler((req, res, next) => {
                this.index(req, res, next);
            })
        );

        this.router.get("/script/new/:contextCode", (req, res, next) => {
            this.getNewScript(req, res, next);
        });

        this.router.post(
            "/script/object/members",
            expressAsyncHandler((req, res, next) => {
                this.getObjectMembers(req, res, next);
            })
        );

        this.router.get(
            "/script/code/:code",
            expressAsyncHandler((req, res, next) => {
                this.getScript(req, res, next);
            })
        );

        this.router.post(
            "/script/code/:code",
            expressAsyncHandler((req, res, next) => {
                this.saveScript(req, res, next);
            })
        );

        this.router.get(
            "/script/code/:code/generate",
            expressAsyncHandler((req, res, next) => {
                this.generateCode(req, res, next);
            })
        );

        this.router.get("/script/code/:code/execute", (req, res, next) => {
            this.executeCode(req, res, next);
        });

        return this.router;
    }

    index(request, response) {
        let knex = KnexConnector.connection;
        let res = knex("script_config")
            .where({
                document_type: "method",
            })
            .whereRaw("data -> ? ->> ? = ?", ["parent_type", "type", "string"]);
        res.then((val) => response.json({ data: val }));
    }

    async getObjectMembers(request, response) {
        let service = new ScriptService();
        let members = await service.getObjectMembers(request.body);
        response.json(new JsonResponse(true, members));
    }

    async getNewScript(request, response) {
        let service = new ScriptService();
        let script = await service.newScript(request.params.contextCode);
        response.json(new JsonResponse(true, script));
    }
    async getScript(request, response) {
        let service = new ScriptService();
        let scriptData = await service.getScript(request.params.code);
        response.json(new JsonResponse(true, scriptData));
    }

    async saveScript(request, response) {
        let service = new ScriptService();
        let script = await service.saveScript(request.params.code, request.body);
        response.json(new JsonResponse(true, script));
    }

    async generateCode(request, response) {
        let service = new ScriptService();
        let scriptData = await service.getScript(request.params.code);
        let code = await service.generateCode(scriptData.data);
        response.json(new JsonResponse(true, code));
    }

    async executeCode(request, response) {
        let service = new ScriptService();
        let executioResponse = await service.executeCode(request.params.code);
        response.json(new JsonResponse(true, executioResponse));
    }
}
