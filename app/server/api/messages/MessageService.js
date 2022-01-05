import BaseDao from "../../integration/elastic/BaseDao";

export class MessageService extends BaseDao {
    getChannelMessages(channelId, limit, start) {
        this.tableName = `stats_${channelId}`;
        return this.loadAllData({}, start, limit);
    }
}
