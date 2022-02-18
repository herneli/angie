// import { BaseService } from "../../integration/elastic";
import { EntityDao } from "./EntityDao";
import { MessageService } from "../messages";

import lodash from "lodash";
import { CheckpointService } from "../checkpoints";
import { BaseService } from "lisco";

export class EntityService extends BaseService {
    constructor() {
        super(EntityDao);
    }

    // /**
    //  * Obtencion de un elemento mediante su identificador
    //  */
    async loadById(id) {
        const entity = await super.loadById(id);

        return entity.data;
    }
}
