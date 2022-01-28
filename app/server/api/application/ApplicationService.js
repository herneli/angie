import { App } from "lisco";
import { ConfigurationService } from "../configuration/ConfigurationService";

export class ApplicationService {
    constructor() {
        this.model = "applications";
        this.confServ = new ConfigurationService();
    }

    getAppplication(code) {
        return this.confServ.getModelDataByCode(this.model, code);


    }
}
