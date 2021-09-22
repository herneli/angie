
import bodybuilder from 'bodybuilder'
import ElasticConnector from './ElasticConnector';

//TODO improve, test and refactor!
export default class BaseDao {
    tableName = ''
    documentType = ''

    constructor() {
        //ElasticConnector
    }


    count(filter) {
        if (!filter) {
            filter = {};
        }
        filter.index = this.tableName;
        filter.type = this.documentType;
        return ElasticConnector.getConnection().count(filter);
    }

    search(filter) {
        if (!filter) {
            filter = {};
        }
        filter.index = this.tableName;
        filter.version = true;
        if (this.documentType) {
            filter.type = this.documentType;
        }
        return ElasticConnector.getConnection().search(filter);
    }

    loadAllData(filter, start, limit) {
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
        return this.search(params);
    }

    get(identifier) {
        let response = await this.search({
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
        });
        const data = response.body;
        if (data.hits.total === 0) {
            return null;
        }

        const order = data.hits.hits[0];
        this.tableName = order._index; //Se sobreescribe para saber en que lugar hacer las modificaciones.
        return order;
    }


    remove(identifier) {
        return ElasticConnector.getConnection().delete({
            index: this.tableName,
            type: this.documentType,
            refresh: true,
            id: identifier
        });
    }

    loadTemplate(content) {
        return ElasticConnector.getConnection().putTemplate(content);
    }
    loadTemplate(content) {
        return ElasticConnector.getConnection().putLifecycle(content);
    }
    createIndex(name) {
        return ElasticConnector.getConnection().indices.create({ index: name });
    }
    existIndex(name) {
        return ElasticConnector.getConnection().indices.exists({ index: name });
    }
    createAlias(index, name, writable) {
        return ElasticConnector.getConnection().indices.updateAliases({
            body: {
                "actions": [
                    { "add": { "index": index, "alias": name, "is_write_index": writable } }
                ]
            }
        });
    }


    parseFiltersObject(filter, size, from) {
        //TODO refactor!
        const res = {};
        var body = new bodybuilder();
        delete filter._dc;
        for (var idx in filter) {

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
    }


    parseSorts(sorts) {
        const result = [];
        let parsedSorts = sorts;
        try {
            parsedSorts = JSON.parse(sorts);
        } catch (e) {

        }
        for (const idx in parsedSorts) {
            const elm = parsedSorts[idx];
            let obj = {};
            obj[elm.property] = {
                order: elm.direction.toLowerCase()
            };
            result.push(obj);
        }

        return result;
    }

    addDocument(id, data) {
        return ElasticConnector.getConnection().index({
            index: this.tableName,
            type: this.documentType ? this.documentType : data.type,
            refresh: true,
            id: id,
            body: data
        });
    }

    updateDocument(tableName, documentType, id, data, version) {

        return ElasticConnector.getConnection().update({
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
        });
    }

    addOrUpdateDocumentNoMerge(id, data) {
        if (!id) return callback('Id cannot be undefined');

        try {
            const indexedData = await this.get(id)
            return this.updateDocument(self.tableName ? self.tableName : indexedData._index, self.documentType ? self.documentType : indexedData._type, id, data, indexedData._version);
        } catch (err) {
            if (err && err.displayName == 'NotFound') {
                return this.addDocument(id, data);
            }

            throw err;
        }
    }
}

