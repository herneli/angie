import { MessageDao } from "./MessageDao";

export class MessageService {
    constructor() {
        this.dao = new MessageDao();
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
}
