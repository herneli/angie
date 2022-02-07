import { BaseService } from "../../integration/elastic";
import { TagService } from "../tags";
import { MessageDao } from "./MessageDao";

import lodash from 'lodash'
export class MessageService extends BaseService {
    constructor() {
        super(MessageDao);
    }

    getChannelMessages(channel, filters) {
        return this.dao.getChannelMessages(channel, filters);
    }

    getChannelMessageCount(channel) {
        return this.dao.getChannelMessageCount(channel);
    }

    getMessageTraces(channel, messageId) {
        return this.dao.getMessageTraces(channel, messageId);
    }

    async listMessagesWithTags(filters, start, limit) {
        const { data: messages } = await this.list(filters, start, limit);

        const identifiers = lodash.uniq(lodash.map(messages, "_id"));

        let tags = [];
        if (!lodash.isEmpty(identifiers)) {
            const tagServ = new TagService();
            const { data: tagData } = await tagServ.list(
                {
                    "messageId.keyword": {
                        type: "termsi",
                        value: identifiers,
                    },
                },
                start,
                limit
            );
            tags = tagData;
        }

        return { tags, raw_messages: messages };
    }
}
