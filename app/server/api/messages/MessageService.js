import { MessageDao } from "./MessageDao";

import { BaseService } from "lisco";
export class MessageService extends BaseService {
    constructor() {
        super(MessageDao);
    }

    async listTagged(filters, start, limit, tagFilter) {
        var start = start || 0;
        var limit = limit || 1000; //Default limit

        let response = {};
        response.total = await this.dao.countFilteredDataTagged(filters, tagFilter);

        if (filters && Object.keys(filters).length !== 0) {
            let filteredData = await this.dao.loadFilteredDataTagged(filters, start, limit, tagFilter);
            response.data = filteredData;
            return response;
        }

        response.data = [];
        response.total = 0;
        return response;
    }

    getChannelMessageCount(channel) {
        return this.dao.getChannelMessageCount(channel);
    }

    getMessageTraces(channel, messageId) {
        return this.dao.getMessageTraces(channel, messageId);
    }
}
