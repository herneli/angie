import { Utils, BaseService, App } from "lisco";
import { ConfigurationService } from "../configuration/ConfigurationService";
import { SectionDao } from "./SectionDao";

export class SectionService extends BaseService {
    constructor() {
        super(SectionDao);
    }

    async updateMenu(data) {
        return await this.dao.updateMenu(data);
    }

    async getMenu() {
        return await this.dao.getMenu();
    }

    async getRoleMenu(role) {
        let menu = await this.getMenu();

        let allowedSections = await this.getAllowedPaths(role);
        let finalMenu = [];

        //TODO filter children recursively
        menu.forEach((menuEntry) => {
            let resp = allowedSections.filter((element) => element == menuEntry.value);
            if (resp.length > 0) {
                finalMenu.push(menuEntry);
            }
        });

        return finalMenu;
    }

    async getAllowedPaths(role) {
        const ConfServ = new ConfigurationService();

        let userRoles = await App.keycloakAdmin.users.listRoleMappings({ id: role });
        let sections = await ConfServ.list("sections", "", "", "");

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

        return allowedSections;
    }
}
