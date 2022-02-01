import { App } from "lisco";
import { ConfigurationService } from "../configuration/ConfigurationService";

export class EntityMapperService {
    constructor() {
        this.model = "entity_mapper";
        this.confServ = new ConfigurationService();
    }

    getEntityMappers(code) {
        return this.confServ.getModelDataByCode(this.model, code);


    }
}
