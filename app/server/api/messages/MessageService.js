import BaseDao from "../../integration/elastic/BaseDao";

export class MessageService extends BaseDao {
    getChannelMessages(channelId, filters) {
        const { start = 1, limit = 10 } = filters;

        this.tableName = `stats_${channelId}`;
        return this.loadAllData({}, start, limit);
    }
}
