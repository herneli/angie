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
        this.router.post("/section/:role/path_allowed", (request, response, next) => {
            this.isPathAllowed(request, response, next);
        });

        this.router.get("/getRoles", (request, response, next) => {
            this.getRoles(request, response, next);
        });

        this.router.get("/getMenuConfiguration", (request, response, next) => {
            this.getMenuConfiguration(request, response, next);
        });

        App.events.on("config_saved_section_config", (data) => {
            this.updateMenu(data.model, data.body);
        });
        App.events.on("config_updated_section_config", (data) => {
            this.updateMenu(data.model, data.body);
        });
        return this.router;
    }

    async updateMenu(model, body) {
        try {
            //!FIXME Iago.S: Se comenta ya que hace alguna cosa rara y no creo que sea necesario
            // const sectServ = new SectionService();

            // //Sobreescribe en función del value ( URl), cuidado con esto.
            // // Si no existe lo guarda.

            // let exists = await sectServ.loadById("51cacf54-eb49-4912-b856-c6a68b14dae1");
            // exists.data.forEach((element, index) => {
            //     if (element.value == body.value) {
            //         return (exists.data[index] = body);
            //     }
            // });

            // let resp = await sectServ.updateMenu(exists.data);
        } catch (e) {
            console.log(e);
        }
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
            const ConfServ = new ConfigurationService();
            const sectServ = new SectionService();

            const id = request.params.role;

            let userRoles = await App.keycloakAdmin.users.listRoleMappings({ id: id });
            let menu = await sectServ.getMenu();
            let sections = await ConfServ.list("section_config", "", "", "");

            let allowedSections = [];
            let finalMenu = [];

            sections.data.forEach((section) => {
                if (section.data && section.data.roles) {
                    userRoles.realmMappings.forEach((userRol) => {
                        if (section.data.roles.find((element) => element == userRol.name)) {
                            allowedSections.push(section.data.value);
                        }
                    });
                }
            });

            menu.forEach((menuEntry) => {
                let resp = allowedSections.filter((element) => element == menuEntry.value);
                if (resp.length > 0) {
                    finalMenu.push(menuEntry);
                }
            });

            var jsRes = new JsonResponse();
            jsRes.success = true;
            jsRes.data = finalMenu;
            response.json(jsRes);
        } catch (e) {
            next(e);
        }
    }

    //Compare Sections
    // Check if Path is available on user roles.
    async isPathAllowed(request, response, next) {
        const ConfServ = new ConfigurationService();

        const id = request.params.role;
        const path = request.body.path;

        let userRoles = await App.keycloakAdmin.users.listRoleMappings({ id: id });
        let sections = await ConfServ.list("section_config", "", "", "");

        let allowedSections = [];

        sections.data.forEach((section) => {
            if (section.data && section.data.roles) {
                userRoles.realmMappings.forEach((userRol) => {
                    if (section.data.roles.find((element) => element == userRol.name)) {
                        allowedSections.push(section.data.value);
                    }
                });
            }
        });

        const intersection = allowedSections.find((element) => element == path);

        var jsRes = new JsonResponse();
        if (intersection) {
            jsRes = new JsonResponse(true, true, null);
        } else {
            jsRes = new JsonResponse(false, false, null);
        }
        response.json(jsRes);
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
