import { App, BaseController, JsonResponse, Utils } from "lisco";
import { SectionService } from "./SectionService";

import expressAsyncHandler from "express-async-handler";
import { ConfigurationService } from "../configuration/ConfigurationService";

export class SectionController extends BaseController {
    configure() {
        super.configure("section", { service: SectionService });

        this.router.post(
            "/section/:role/check_allowed",
            expressAsyncHandler((res, req, next) => {
                this.getAllowedSectionBasedOnRole(res, req, next);
            })
        );
        this.router.get("/roles", (request, response, next) => {
            this.getRoles(request, response, next);
        });

        this.router.get("/menu/schema", (request, response, next) => {
            this.getMenuConfiguration(request, response, next);
        });

        return this.router;
    }

    async getMenuConfiguration(request, response) {
        //const ConfServ = new ConfigurationService();
        const sectServ = new SectionService();

        var data = await sectServ.getMenu();
        var jsRes = new JsonResponse();
        jsRes.success = true;
        jsRes.data = data;
        response.json(jsRes);
    }

    // Get allowed sections for Roles
    async getAllowedSectionBasedOnRole(request, response, next) {
        try {
            const sectServ = new SectionService();

            const id = request.params.role;

            const finalMenu = await sectServ.getRoleMenu(id);
            const allowedPaths = await sectServ.getAllowedPaths(id);

            var jsRes = new JsonResponse();
            jsRes.success = true;
            jsRes.menu = finalMenu;
            jsRes.allowedPaths = allowedPaths;
            response.json(jsRes);
        } catch (e) {
            next(e);
        }
    }

    async getRoles(request, response, next) {
        try {
            let applicationRoles = await App.keycloakAdmin.roles.find();

            var jsRes = new JsonResponse();
            jsRes = new JsonResponse(true, applicationRoles, null);
            response.json(jsRes);
        } catch (e) {
            next(e);
        }
    }
}
