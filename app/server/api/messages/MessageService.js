import BaseDao from "../../integration/elastic/BaseDao";

export class MessageService extends BaseDao {
    getChannelMessages(channelId, filters) {
        const { start = 1, limit = 10 } = filters;

        this.tableName = `stats_${channelId}`;
        return this.loadAllData({}, start, limit);
    }

    getChannelMessageCount(channelId) {
        this.tableName = `stats_${channelId}`;
        //Los filtros se establecen manualmente al ser estáticos y utilizarse directamente el método search()
        const filters = {
            size: 0,
            body: {
                aggs: {
                    messages: {
                        cardinality: {
                            field: "breadcrumb_id.keyword",
                        },
                    },
                    errorMessages: {
                        filter: { term: { "event.keyword": "ERROR" } },
                        aggs: {
                            total: {
                                cardinality: {
                                    field: "breadcrumb_id.keyword",
                                },
                            },
                        },
                    },
                },
            },
        };

        return this.search(filters);
    }
}
