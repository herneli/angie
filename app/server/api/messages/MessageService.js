import BaseDao from "../../integration/elastic/BaseDao";

export class MessageService extends BaseDao {
    getChannelMessages(channelId, filters) {
        const { start = 1, limit = 10 } = filters;

        this.tableName = `stats_${channelId}`;
        return this.loadAllData({}, start, limit);
    }

    async getChannelMessageCount(channelId) {
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

        const messages = { total: 0, error: 0, sent: 0 };

        try {
            const response = await this.search(filters);
            const responseData = response.body.aggregations || false;

            if (responseData) {
                messages.total = responseData.messages.value || 0;
                messages.error = responseData.errorMessages.total.value || 0;
                messages.sent = messages.total - messages.error;
            }
        } catch (e) {
            if (e.body && e.body.status === 404) {
                // console.log("Canal sin mensajes");
            } else {
                console.error("Error de conexión con Elastic:");
                console.error(e);
            }
        }
        return messages;
    }
}
