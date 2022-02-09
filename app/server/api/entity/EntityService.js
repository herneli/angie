// import { BaseService } from "../../integration/elastic";
import { EntityDao } from "./EntityDao";
import { MessageService } from "../messages";

import lodash from "lodash";
import { TagService } from "../tags";
import { BaseService } from "lisco";

export class EntityService extends BaseService {
    constructor() {
        super(EntityDao);
    }

    // /**
    //  * Obtencion de un elemento mediante su identificador
    //  */
    async loadById(id, msg_filters, selection) {
        const entity = await super.loadById(id);

        const messageIds = lodash.map(entity.data.messages, "id");
        const tagService = new TagService();
        const { data, total } = await tagService.getWithMessages(messageIds, msg_filters, selection);

        entity.data.tags = data.tags;
        entity.data.messages = data.messages;
        entity.data.total = total;

        return entity.data;
    }
}
