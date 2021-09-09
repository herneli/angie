var BaseDao = require('app/server/integration/elastic/BaseDao.js');
var ReindexDaoElastic = require('app/server/integration/elastic/ReindexDaoElastic.js');

var Message = require('app/server/model/Message.js');
var MessageReceivedDetail = require('app/server/model/MessageReceivedDetail.js');
var async = require('async');

var MessageDaoElastic = BaseDao.extend({
    tableName: 'messages_*',
    documentType: 'message',

    doQuery: function (params, callback) {
        this.search(params, function (err, data) {
            if (err) return callback(err);

            try {
                var result = {};
                var msgs = [];
                for (var idx in data.hits.hits) {
                    var elm = data.hits.hits[idx];
                    if (!elm._source) {
                        continue;
                    }
                    var msg = new Message.Model();

                    msg.source = elm._source;
                    msg.type = 'message';
                    msg.id = elm._source.source.channelId + "|" + elm._id;
                    msg.status = elm._source.source.status;
                    msg.message_id = elm._source.source.sourceMessage.messageId;
                    msg.reception_date = elm._source.source.receptionDate;
                    msg.message_content = elm._source.source.sourceMessage.sourceMessageContent;
                    msg.message_type = elm._source.source.sourceMessage.sourceMessageType;
                    msg.hl7_version = elm._source.source.hl7Version;
                    msg.id_channel = elm._source.source.channelId;
                    msg.channel_name = elm._source.source.channelName;
                    msg.sourceMessageJson = elm._source.source.sourceMessage.sourceMessageJson;

                    //Obtencion del detalle
                    if (elm._source.destination) {

                        msg.message_received_detail = [];
                        for (var jx in elm._source.destination) {
                            var subEl = elm._source.destination[jx];
                            var msgDetail = new MessageReceivedDetail.Model();
                            msgDetail.response_date = subEl.response.responseDate;
                            msgDetail.response_status = subEl.response.responseStatus;
                            msgDetail.response_error = subEl.processingError;
                            msgDetail.response_message = "";
                            msgDetail.msg_received_id = elm._id;
                            msgDetail.transformed_message_content = subEl.transformedMessage;
                            if (Object.keys(msgDetail.transformed_message_content) == 0 && !subEl.processingError) {
                                msgDetail.transformed_message_content = msg.message_content;
                            }
                            msgDetail.destination_id = subEl.destinationId;
                            msgDetail.destinationName = subEl.destinationName;
                            msg.message_received_detail.push(msgDetail);
                        }
                    }
                    msgs.push(msg);
                }
                result.data = msgs;
                result.total = data.hits.total;
                return callback(null, result);
            } catch ($ex) {
                return callback($ex);
            }
        });
    },
    loadAllData: function (filter, start, limit, callback) {
        var params = {};
        if (start) {
            params.from = start;
        }
        if (limit) {
            params.size = limit;
        }

        if (filter.withoutSource) { //Parametro utilizado para que las querys no lleven el source
            delete filter.withoutSource;
            params._source = false;
        }

        var parsedFilters = this.parseFiltersObject(filter, limit, start);
        if (Object.keys(parsedFilters).length !== 0) {
            if (!params.body) {
                params.body = {};
            }
            if (Object.keys(parsedFilters).length > 0) {
                params.body = parsedFilters;
            }
        }
        if (filter.sort) {
            if (!params.body) {
                params.body = {};
            }
            params.body.sort = this.parseSorts(filter.sort);
        }


        this.doQuery(params, callback);

    },
    getById: function (identifier, callback) {
        //Si el identificador viene como channelId|msgId se separa
        if (identifier.indexOf('|') !== -1) {
            var parts = identifier.split('|');
            this.tableName = "messages_" + parts[0];
            return this.get(parts[1], callback);
        }
        return this.get(identifier, callback);
    },
    /**
     * Metodo de eliminado.
     *
     * El identificador es obligatorio para poder localizar el elemento a eliminar.
     */
    remove: function (identifier, callback) {
        //Si el identificador viene como channelId|msgId se separa
        if (identifier.indexOf('|') !== -1) {
            var parts = identifier.split('|');
            this.tableName = "messages_" + parts[0];
            return this._super(parts[1], callback);
        }
        return this._super(identifier, callback);
    },

    getMessageTypes: function (callback) {
        var params = {
            body: {
                size: 0,
                "aggregations": {
                    "message_type": {
                        "terms": {
                            "field": "source.sourceMessage.sourceMessageType"
                        }
                    }
                }
            }
        };
        this.search(params, function (err, data) {
            if (err) return callback(err);

            var result = [];
            for (var idx in data.aggregations.message_type.buckets) {
                var elm = data.aggregations.message_type.buckets[idx];
                result.push({ id: elm.key, name: elm.key });
            }
            callback(null, result);
        });
    },
    getMessageStatuses: function (callback) {
        var params = {
            body: {
                size: 0,
                "aggregations": {
                    "message_statuses": {
                        "terms": {
                            "field": "source.status"
                        }
                    }
                }
            }
        };
        this.search(params, function (err, data) {
            if (err) return callback(err);

            var result = [];
            for (var idx in data.aggregations.message_statuses.buckets) {
                var elm = data.aggregations.message_statuses.buckets[idx];
                result.push({ id: elm.key, name: elm.key });
            }
            callback(null, result);
        });
    },
    getHl7Versions: function (callback) {
        var params = {
            body: {
                size: 0,
                "aggregations": {
                    "message_statuses": {
                        "terms": {
                            "field": "source.hl7Version"
                        }
                    }
                }
            }
        };
        this.search(params, function (err, data) {
            if (err) return callback(err);

            var result = [];
            for (var idx in data.aggregations.message_statuses.buckets) {
                var elm = data.aggregations.message_statuses.buckets[idx];
                result.push({ id: elm.key, name: elm.key });
            }
            callback(null, result);
        });
    },

    loadReportMessages: function (filter, callback) {
        var params = {};
        var parsedFilters = this.parseFiltersObject(filter);
        if (Object.keys(parsedFilters).length !== 0) {
            if (!params.body) {
                params.body = {};
            }
            if (Object.keys(parsedFilters).length > 0) {
                params.body = parsedFilters;
            }
        }
        this.search(params, function (err, data) {
            if (err) return callback(err);

            try {
                var result = {};
                var msgs = [];
                for (var idx in data.hits.hits) {
                    var elm = data.hits.hits[idx];
                    var msg = new Message.Model();

                    msg.source = elm._source;
                    msg.id = elm._id;
                    msg.status = elm._source.source.status;
                    msg.message_id = elm._source.source.sourceMessage.messageId;
                    msg.reception_date = elm._source.source.receptionDate;
                    msg.message_content = elm._source.source.sourceMessage.sourceMessageContent;
                    msg.message_type = elm._source.source.sourceMessage.sourceMessageType;
                    msg.hl7_version = elm._source.source.hl7Version;
                    msg.id_channel = elm._source.source.channelId;
                    msg.channel_name = elm._source.source.channelName;
                    msg.sourceMessageJson = elm._source.source.sourceMessage.sourceMessageJson;

                    //Obtencion del detalle
                    if (elm._source.destination) {

                        msg.message_received_detail = [];
                        for (var jx in elm._source.destination) {
                            var subEl = elm._source.destination[jx];
                            var msgDetail = new MessageReceivedDetail.Model();
                            msgDetail.response_date = subEl.response.responseDate;
                            msgDetail.response_status = subEl.response.responseStatus;
                            msgDetail.response_error = "";
                            msgDetail.response_message = "";
                            msgDetail.msg_received_id = elm._id;
                            msgDetail.transformed_message_content = subEl.transformedMessage;
                            msgDetail.destination_id = subEl.destinationId;
                            msgDetail.destinationName = subEl.destinationName;
                            msg.message_received_detail.push(msgDetail);
                        }
                    }
                    msgs.push(msg);
                }
                result.data = msgs;
                result.total = data.hits.total;
                return callback(null, result);
            } catch ($ex) {
                return callback($ex);
            }
        });
    },
    reindexElasticChannel: function (channel, callback) {
        var reindexDao = new ReindexDaoElastic();
        reindexDao.reindex("messages_" + channel, function (err, data) {
            return callback(err, data);
        });
    },
    putMessage: function () {

    },

    getMessageByMessageId: function (identifier, callback) {

        this.doQuery({
            "source.sourceMessage.messageId": identifier
        }, callback);
    },

    loadByIdAndChannel: function (identifier, channelId, callback) {
        // var filter = {
        //     "source.sourceMessage.messageId": identifier,
        //     "source.channelId": channelId
        // };
        var params = {};
        // var parsedFilters = this.parseFiltersObject(filter, 0, 100);

        if (!params.body) {
            params.body = {
                "query": {
                    "bool": {
                        "must": [
                            { "match": { "source.sourceMessage.messageId": identifier } },
                            { "match": { "source.channelId": channelId } }
                        ]
                    }
                }
            };
        }


        this.search(params, callback);
    },
    loadByMSA2: function (identifier, orderIdentifier, channelId, callback) {
        var params = {};

        if (!params.body) {
            params.body = {
                "min_score": 0.5,
                "query": {

                    "bool": {
                        "must": [
                            { "exists": { "field": "*.MSA-2" } },
                            { "match": { "source.channelId": channelId } }
                        ],
                        "should": [
                            {
                                "multi_match": {
                                    "query": orderIdentifier,
                                    "fields": [
                                        "*.MSA-2"
                                    ]
                                }
                            },
                            {
                                "multi_match": {
                                    "query": identifier,
                                    "fields": [
                                        "*.MSA-2"
                                    ]
                                }
                            }
                        ]
                    }
                }
            };
        }


        this.search(params, callback);
    },
    addDocument: function (indexName, type, id, data, callback) {

        global.esstats.addCount++;
        return global.elastic.index({
            index: 'messages_' + indexName,
            type: type,
            id: id,
            refresh: true,
            body: data
        }, function (err, obj) {
            callback(err, obj.body);
        });
    },


    deleteOld: function (indexName, toDate, callback) {


        var query = {
            "query": {
                "range": {
                    "source.receptionDate": {
                        "lte": toDate
                    }
                }
            }
        };
        var params = {};
        params.index = 'messages_' + indexName;
        params.body = query;

        global.elastic.deleteByQuery(params, callback);
    }
});

module.exports = MessageDaoElastic;