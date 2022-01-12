import bodybuilder from "bodybuilder";
import ElasticConnector from "./ElasticConnector";

//TODO improve, test and refactor!
export default class BaseDao {
    tableName = "";
    documentType = "";

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
        if (filter.withoutSource) {
            //Parametro utilizado para que las querys no lleven el source
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
        // global.esstats.searchCount++;
        return this.search(params);
    }

    async get(identifier) {
        let response = await this.search({
            index: this.tableName,
            type: this.documentType,
            version: true,
            body: {
                from: 0,
                size: 1,
                query: {
                    bool: {
                        filter: {
                            term: {
                                _id: identifier,
                            },
                        },
                    },
                },
            },
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
            id: identifier,
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
                actions: [{ add: { index: index, alias: name, is_write_index: writable } }],
            },
        });
    }

    parseFiltersObject(filter, size, from) {
        const body = new bodybuilder();

        for (let index in filter) {
            const element = filter[index];
            if (typeof element === "object") {
                switch (element.type) {
                    //TODO: Añadir más opciones
                    case "date":
                    case "between":
                        if (element.start && element.end) {
                            body.query("range", index, { gte: element.start, lte: element.end });
                        }
                        if (element.start && !element.end) {
                            body.query("range", index, { gte: element.start });
                        }
                        if (!element.start && element.end) {
                            body.query("range", index, { lte: element.end });
                        }
                        break;
                    case "query_string":
                        body.andFilter("query_string", "query", element.value);
                        break;
                    // case "jsonb":
                    //     break;
                    case "greater":
                        body.query("range", index, { gt: element.value });
                        break;
                    case "greaterEq":
                        body.query("range", index, { gte: element.value });
                        break;
                    case "less":
                        body.query("range", index, { lt: element.value });
                        break;
                    case "lessEq":
                        body.query("range", index, { lte: element.value });
                        break;
                    case "exists":
                    case "notnull":
                        body.query("exists", index, element.value);
                        break;
                    case "notExists":
                        body.notQuery("exists", index, element.value);
                        break;
                    case "exact":
                        body.filter("term", index, element.value);
                        break;
                    case "in":
                    case "terms":
                        if (element.value && Array.isArray(element.value)) {
                            body.filter("terms", index, element.value.join().toLowerCase().split(","));
                        } else if (element.value && element.toLowerCase) {
                            body.filter("terms", index, [element.value.toLowerCase()]);
                        } else if (element.value) {
                            body.filter("terms", index, [element.value]);
                        }
                        break;
                    case "termsi":
                        Array.isArray(element.value)
                            ? body.filter("terms", index, element.value.join().split(","))
                            : body.filter("terms", index, [element.value]);
                        break;

                    case "not":
                        body.notFilter("term", index, element.value);
                        break;
                    case "like":
                    case "wildcard":
                        body.query("wildcard", index, "*" + element.value.toLowerCase() + "*");
                        break;
                    case "likeI":
                        body.query("wildcard", index, "*" + element.value + "*");
                        break;
                    //  case "null":
                    //TODO: Revisar null_value
                    //
                    //     break;
                }
            } else {
                //Si el valor no es un objeto se hace una comparación del campo con el valor
                body.filter("term", index, element);
            }
        }
        // const result = body.size(size).from(from).build("v2");
        const result = body.build("v2");
        return result;
    }

    parseSorts(sorts) {
        const result = [];
        let parsedSorts = sorts;
        try {
            parsedSorts = JSON.parse(sorts);
        } catch (e) {}
        for (const idx in parsedSorts) {
            const elm = parsedSorts[idx];
            let obj = {};
            obj[elm.property] = {
                order: elm.direction.toLowerCase(),
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
            body: data,
        });
    }

    updateDocument(tableName, documentType, id, data, version) {
        return ElasticConnector.getConnection().update({
            index: tableName,
            type: documentType,
            refresh: true,
            id: id,
            _source: "true",
            //version: version,
            retry_on_conflict: 3,
            body: {
                doc: data,
            },
        });
    }

    async addOrUpdateDocumentNoMerge(id, data) {
        if (!id) return callback("Id cannot be undefined");

        try {
            const indexedData = await this.get(id);
            return this.updateDocument(
                self.tableName ? self.tableName : indexedData._index,
                self.documentType ? self.documentType : indexedData._type,
                id,
                data,
                indexedData._version
            );
        } catch (err) {
            if (err && err.displayName == "NotFound") {
                return this.addDocument(id, data);
            }

            throw err;
        }
    }
}
