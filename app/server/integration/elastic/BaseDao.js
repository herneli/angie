var BodyBuilder = require('bodybuilder');
var lodash = require('lodash');
var moment = require('moment');

var BaseDao = Class.extend({

    tableName: '',
    documentType: '',



    count: function (filter, callback) {
        if (!filter) {
            filter = {};
        }
        filter.index = this.tableName;
        filter.type = this.documentType;
        global.elastic.count(filter, function (err, obj) {
            callback(err && err.body ? err.body : err, obj.body);
        });
    },
    search: function (filter, callback) {
        if (!filter) {
            filter = {};
        }
        filter.index = this.tableName;
        filter.version = true;
        if (this.documentType) {
            filter.type = this.documentType;
        }
        global.esstats.searchCount++;
        global.elastic.search(filter, function (err, obj) {
            callback(err && err.body ? err.body : err, obj.body);
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
        global.esstats.searchCount++;
        this.search(params, callback);
    },
    get: function (identifier, callback) {
        var self = this;
        global.esstats.searchCount++;
        return global.elastic.search({
            index: this.tableName,
            type: this.documentType,
            version: true,
            body: {
                "from": 0,
                "size": 1,
                "query": {
                    "bool": {
                        "filter": {
                            "term": {
                                "_id": identifier
                            }
                        }
                    }
                },
            }
        }, function (err, response) {
            if (err) return callback(err && err.body ? err.body : err);

            var data = response.body;
            if (data.hits.total === 0) {
                return callback({ displayName: 'NotFound' }, { found: false });
            }

            var order = data.hits.hits[0];
            self.tableName = order._index; //Se sobreescribe para saber en que lugar hacer las modificaciones.
            return callback(err, order);
        });
    },
    loadById: function (identifier, callback) {
        //!FIXME mirar si esto se puede quitar
        global.esstats.searchCount++;
        return global.elastic.search({
            index: this.tableName,
            type: this.documentType,
            version: true,
            body: {
                "from": 0,
                "size": 1,
                "query": {
                    "bool": {
                        "filter": {
                            "term": {
                                "_id": identifier
                            }
                        }
                    }
                },
            }
        }, function (err, obj) {
            callback(err && err.body ? err.body : err, obj.body);
        });
    },
    remove: function (identifier, callback) {
        return global.elastic.delete({
            index: this.tableName,
            type: this.documentType,
            refresh: true,
            id: identifier
        }, function (err, obj) {
            callback(err && err.body ? err.body : err, obj.body);
        });
    },
    loadTemplate: function (templateContent, callback) {
        global.elastic.indices.putTemplate(templateContent).then(function (data) {
            callback(null, data.body);
        }, function (err) {
            callback(err && err.body ? err.body : err);
        });
    },
    createPolicy: function (templateContent, callback) {
        global.elastic.ilm.putLifecycle(templateContent).then(function (data) {
            callback(null, data.body);
        }, function (err) {
            callback(err && err.body ? err.body : err);
        });
    },
    createIndex: function (name, callback) {
        global.elastic.indices.create({ index: name }).then(function (data) {
            callback(null, data.body);
        }, function (err) {
            callback(err && err.body ? err.body : err);
        });
    },
    createAlias: function (index, name, writable, callback) {
        global.elastic.indices.updateAliases({
            body: {
                "actions": [
                    { "add": { "index": index, "alias": name, "is_write_index": writable } }
                ]
            }
        }).then(function (data) {
            callback(null, data.body);
        }, function (err) {
            callback(err && err.body ? err.body : err);
        });
    },
    existIndex: function (name, callback) {
        global.elastic.indices.exists({ index: name }).then(function (data) {
            callback(null, data.body);
        }, function (err) {
            callback(err && err.body ? err.body : err);
        });
    },
    parseFiltersObject: function (filter, size, from) {
        var res = {};
        var body = new BodyBuilder();
        delete filter._dc;
        for (var idx in filter) {
            //Para el filtrado por fechas de las peticiones, React manda parámetros innecesarios y con un formato que
            //no corresponde.
            if ((idx.indexOf('date') !== -1 && Array.isArray(filter[idx])) || idx.indexOf('dateformatted') !== -1) {
                continue;
            }

            var elm = filter[idx];
            if (elm === "" || idx === 'sort') continue;
            var type = idx.substring(idx.length - 1);
            if (type === 'F' || type === 'T') { //Las fechas en rango vendran como claveF o claveT
                if (!res.range) {
                    res.range = {};
                }
                idx = idx.substring(0, idx.length - 1);
                switch (type) {
                    case 'F':
                        if (!res.range[idx]) {
                            res.range[idx] = {};
                        }
                        res.range[idx].gte = elm;
                        break;
                    case 'T':
                        if (!res.range[idx]) {
                            res.range[idx] = {};
                        }
                        res.range[idx].lte = elm;
                        break;
                }
            } else {
                var idxArr = idx.split("##");
                idx = idxArr[0];
                var filterType = "";
                if (idxArr.length > 1) {
                    filterType = idxArr[1];
                }
                if (!filterType && idx == 'patient_fullname') {
                    filterType = 'wildcard';
                }

                switch (filterType) {
                    case 'query_string':
                        body.andFilter('query_string', idx, elm);
                        break;
                    case 'exist':
                        if (elm && elm != "null") {
                            body.filter('exists', idx);
                        } else {
                            body.notFilter('exists', idx);
                        }
                        break;
                    case 'multiOr':
                        for (var i in elm) {
                            var item = elm[i];
                            body.orFilter('match', idx, item);
                        }
                        break;
                    case 'multiTerm':
                        for (var i in elm) {
                            var item = elm[i];
                            body.orFilter('match', idx, item);
                        }
                        break;
                    case 'terms':
                        if (elm && Array.isArray(elm)) {
                            body.filter('terms', idx, elm.join().toLowerCase().split(','));
                        } else if (elm && elm.toLowerCase) {
                            body.filter('terms', idx, [elm.toLowerCase()]);
                        } else if (elm) {
                            body.filter('terms', idx, [elm]);
                        }
                        break;
                    //Como terms pero ignorando el case change
                    case 'termsi':
                        Array.isArray(elm) ? body.filter('terms', idx, elm.join().split(',')) : body.filter('terms', idx, [elm]);
                        break;
                    case 'wildcard':
                        //Se filtra la propiedad not analized (widget)
                        body.query('wildcard', idx, "*" + elm.toLowerCase() + "*");
                        break;
                    case 'orGroup':
                        body.andFilter('bool', function (orGroup) {
                            if (Array.isArray(elm)) {
                                for (var i in elm) {
                                    var item = elm[i];
                                    orGroup.orFilter('match', idx, item);
                                }
                            } else {
                                orGroup.orFilter('match', idx, elm);
                            }
                            return orGroup;
                        });
                        break;
                    case 'andGroup':
                        body.andFilter('bool', function (orGroup) {
                            for (var i in elm) {
                                var item = elm[i];
                                orGroup.orFilter('match', idx, item);
                            }
                            return orGroup;
                        });
                        break;
                    case 'orGroupMulti':
                        body.andFilter('bool', function (orGroup) {
                            if (Array.isArray(elm)) {
                                for (var i in elm) {
                                    var item = elm[i];
                                    orGroup.orFilter('match', Object.keys(item)[0], item[Object.keys(item)[0]]);
                                    orGroup.orFilter('multi_match', 'fields', [Object.keys(item)[1]], { 'query': item[Object.keys(item)[1]] });
                                }
                            } else {
                                orGroup.orFilter('match', idx, elm);
                            }
                            return orGroup;
                        });
                        break;
                    case "term":
                        body.filter('term', idx, elm);
                        break;
                    default:
                        body.filter('match', idx, elm);

                }
            }
        }
        //Se recorren todos los rangos y se añaden a la query
        if (Object.keys(res).length > 0 &&
            Object.keys(res.range).length > 0) {
            for (var key in res.range) {
                body.filter('range', key, res.range[key]);
            }
        }
        var result = body.size(size).from(from).build('v2');
        return result;
    },
    parseSorts: function (sorts) {
        var result = [];
        var parsedSorts = sorts;
        try {
            parsedSorts = JSON.parse(sorts);
        } catch (e) {

        }
        for (var idx in parsedSorts) {
            var elm = parsedSorts[idx];
            var obj = {};
            switch (elm.property) {
                case 'orderIdOrigin':
                case 'orderIdDestination':
                case 'order':
                case 'destination':
                    obj[elm.property + '.widget'] = {
                        order: elm.direction.toLowerCase()
                    };
                    break;
                default:
                    obj[elm.property] = {
                        order: elm.direction.toLowerCase()
                    };
            }
            result.push(obj);
        }

        return result;
    },
    getFieldMapping: function (fields, callback) {
        var params = {
            index: this.tableName,
            type: this.documentType,
            fields: fields
        };
        global.elastic.indices.getFieldMapping(params).then(function (data) {
            callback(null, data);
        }, function (err) {
            callback(err);
        });
    },
    addDocument: function (id, data, callback) {
        global.esstats.addCount++;
        return global.elastic.index({
            index: this.tableName,
            type: this.documentType ? this.documentType : data.type,
            refresh: true,
            id: id,
            body: data
        }, function (err, obj) {
            callback(err && err.body ? err.body : err, obj.body);
        });
    },

    entityMerge: function (source, newData) {
        return lodash.assignWith(source, newData, function (originalObjValue, newObjValue, fieldname) {
            if (fieldname === 'status_seq' || fieldname === 'status' || fieldname === 'status_no_seq' || fieldname === 'status_warning') { //Propiedades especiales
                return newObjValue;
            }
            if (fieldname == 'messages') { //El listado de mensajes agrupa objetos uniendolos a partir de su id
                return lodash.assignWith(originalObjValue, newObjValue, function (ori2, new2, field2) {
                    if (lodash.isArray(ori2)) {
                        return lodash.unionBy(new2, ori2, 'id');
                    }
                });
            }

            if (lodash.isArray(originalObjValue)) { //Los arrays se comprueban de forma que se "mezclen" sus valores
                var found = false;
                for (var idx in originalObjValue) {
                    var item = originalObjValue[idx];
                    if (lodash.isEqual(item, newObjValue[0])) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return originalObjValue.concat(newObjValue);
                }
                return originalObjValue;
            }

            //Si llega aqui se ejecuta el assign por defecto
        });
    },
    addOrUpdateDocument: function (id, data, messageType, callback) {
        var self = this;
        var partialT = global.utils.clock();

        if (!id) return callback('Id cannot be undefined');

        this.get(id, function (err, indexedData) {
            if (err && err.displayName !== 'NotFound') {
                return callback(err);
            }

            if ((err && err.displayName == 'NotFound' || indexedData.found === false || indexedData.error) && messageType) {
                data.creation_msg_type = messageType; //Si la peticion no existe se registra el tipo de mensaje que la creo
                data.date = moment(new Date()).toISOString();
                if (!data.demog_status) {
                    data.demog_status = "uncheck";
                }
                return self.addDocument(id, data, function (err, response) {
                    console.perf('SaveDocument ' + id + " *NEW* " + (global.utils.clock(partialT)).toFixed(2) + ' ms');
                    callback(err, data);
                });
            }
            if (indexedData._source) {
                //LIMIT message qty

                var valuesList = lodash.values(indexedData._source.messages);
                var unsortedMessages = [].concat.apply([], valuesList);

                var limit = global.settings.getConfigValue('messageLimitByOrder') || 10000;
                if (unsortedMessages.length >= limit) {
                    var IncidenceService = require('app/modules/status_control/service/IncidenceService.js');
                    var incidenceService = new IncidenceService();
                    return incidenceService.generateLimitIncidence(indexedData._source, function () {
                        return self.private.updateDocument(self.tableName ? self.tableName : indexedData._index, self.documentType ? self.documentType : indexedData._type, id, indexedData._source, indexedData._version, function (err, response) {
                            callback(err, indexedData._source);
                        });
                    });
                }


                var merged = self.entityMerge(indexedData._source, data);
                console.perf('SaveDocument ' + id + " *MERGE* " + (global.utils.clock(partialT)).toFixed(2) + ' ms');
                partialT = global.utils.clock();
                return self.private.updateDocument(self.tableName ? self.tableName : indexedData._index, self.documentType ? self.documentType : indexedData._type, id, merged, indexedData._version, function (err, response) {
                    console.perf('SaveDocument ' + id + " *UPDATE* " + (global.utils.clock(partialT)).toFixed(2) + ' ms');
                    callback(err && err.body ? err.body : err, merged);
                });
            }
        });
    },
    addOrUpdateDocumentNoMerge: function (id, data, callback) {
        var self = this;
        if (!id) return callback('Id cannot be undefined');

        this.get(id, function (err, indexedData) {
            if (err && err.displayName == 'NotFound') {
                return self.addDocument(id, data, function (err2, response) {
                    callback(err2, data);
                });
            }

            return self.private.updateDocument(self.tableName ? self.tableName : indexedData._index, self.documentType ? self.documentType : indexedData._type, id, data, indexedData._version, function (err3, response) {
                callback(err3, data);
            });
        });
    },
    private: {
        updateDocument: function (tableName, documentType, id, data, version, callback) {

            global.esstats.updateCount++;
            return global.elastic.update({
                index: tableName,
                type: documentType,
                refresh: true,
                id: id,
                _source: 'true',
                //version: version,
                retry_on_conflict: 3,
                body: {
                    doc: data
                }
            }, function (err, obj) {
                var doc = null;
                if (obj.body && obj.body.get && obj.body.get._source) {
                    doc = obj.body.get._source;
                }
                callback(err && err.body ? err.body : err, doc);
            });
        }
    }
});

module.exports = BaseDao;