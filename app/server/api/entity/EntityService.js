// import { BaseService } from "../../integration/elastic";
import { EntityDao } from "./EntityDao";
import { ConfigurationService } from "../configuration/ConfigurationService";

import lodash from "lodash";
import { CheckpointService } from "../checkpoints";
import { BaseService } from "lisco";

export class EntityService extends BaseService {
    constructor() {
        super(EntityDao);
    }

    /**
     * Obtencion de un elemento mediante su identificador
     */
    async loadById(id) {
        const entity = await super.loadById(id);

        let { data } = entity;

        //Tipo entidad
        let configurationService = new ConfigurationService();
        let element = await configurationService.list("entity_type", { code: data.type });
        if (element.data && element.data[0]) {
            let entity_type = { entity_type: element.data[0] };
            data["entity_type_name"] =
                element && element.data[0] && element.data[0].data && element.data[0].data.name
                    ? element.data[0].data.name
                    : "";
            data = { ...data, ...entity_type };
        }
        return data;
    }
}
