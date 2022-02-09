// import { BaseService } from "../../integration/elastic";
import { TagService } from "../tags";
import { MessageDao } from "./MessageDao";

import lodash from "lodash";
import { BaseService } from "lisco";
export class MessageService extends BaseService {
    constructor() {
        super(MessageDao);
    }

    // getChannelMessages(channel, filters) {
    //     return this.dao.getChannelMessages(channel, filters);
    // }

    // getChannelMessageCount(channel) {
    //     return this.dao.getChannelMessageCount(channel);
    // }

    // getMessageTraces(channel, messageId) {
    //     return this.dao.getMessageTraces(channel, messageId);
    // }
}
