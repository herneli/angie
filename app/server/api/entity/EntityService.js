import { BaseService } from "../../integration/elastic";
import { EntityDao } from "./EntityDao";
import { MessageService } from "../messages";

import lodash from "lodash";
import { TagService } from "../tags";

export class EntityService extends BaseService {
    constructor() {
        super(EntityDao);
    }

    /**
     * Obtencion de un elemento mediante su identificador
     */
    async loadById(id, msg_filters) {
        const entity = await super.loadById(id);

        const messageIds = lodash.map(entity._source.messages, "id");
        //Obtener los mensajes de la peticion, se permite filtrado
        let messages = [];
        if (!lodash.isEmpty(messageIds)) {
            const messageDao = new MessageService();
            const { data: msgData } = await messageDao.list(
                {
                    _id: {
                        type: "termsi",
                        value: messageIds,
                    },
                    ...msg_filters,
                },
                0,
                1000
            );
            messages = msgData;
        }
        entity.raw_messages = messages;

        //En base a los mensajes ya filtrados, obtener los tags.
        const msgIdentifiers = lodash.uniq(lodash.map(entity.raw_messages, "_id"));
        let tags = [];
        if (!lodash.isEmpty(msgIdentifiers)) {
            const tagDao = new TagService();
            const { data: tagData } = await tagDao.list(
                {
                    "messageId.keyword": {
                        type: "termsi",
                        value: msgIdentifiers,
                    },
                },
                0,
                1000
            );

            tags = tagData;
        }
        entity.tags = tags;

        return entity;
    }
}
