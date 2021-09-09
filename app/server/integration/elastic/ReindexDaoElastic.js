var async = require('async');
var spawn = require('child_process').spawn;

var ReindexDaoElastic = Class.extend({

    reindex: function (index, callback) {
        var self = this;

        console.debug('Reindexando canal: ' + index);

        //Ejecucion de la serie
        async.series([
            function (innerCb) {
                //Primero borramos el backup
                console.debug('Limpiando indice de backup por seguridad');
                self.deleteIndex(index + "_backup", function (err) {
                    if (err) {
                        if (err.toString().indexOf('index_not_found_exception') !== -1) {
                            return innerCb(null);
                        }
                        return innerCb(err);
                    }
                    return innerCb(err);
                });
            },
            function (innerCb) {
                console.debug('Realizando backup');
                //Copiamos los datos al backup desde el original
                self.cloneIndex(index, index + "_backup", innerCb);
            },
            function (innerCb) {
                console.debug('Eliminando original');
                //Borramos el indice original
                self.deleteIndex(index, innerCb);
            },
            function (innerCb) {
                console.debug('Restaurando backup');
                //Copiamos los datos del backup al original
                self.cloneIndex(index + "_backup", index, innerCb);
            },
            function (innerCb) {
                console.debug('Limpiando backup');
                //Por ultimo  borramos el backup
                self.deleteIndex(index + "_backup", innerCb);
            }

        ], function (err, data) {
            if (err != undefined) {
                return callback(err, null);
            }
            return callback(null, true);
        });
    },


    deleteIndex: function (index, callback) {
        var params = {
            "index": index
        };
        global.elastic.indices.delete(params, function (err, data) {
            if (err != undefined) {
                return callback(err, null);
            }
            return callback(null, data);
        });

    },
    cloneIndex: function (source, dest, callback) {
        var params = {
            "body": {
                "source": {
                    "index": source
                },
                "dest": {
                    "index": dest
                }
            }
        };

        global.elastic.reindex(params, function (err, data) {
            if (err != undefined) {
                return callback(err, null);
            }
            return callback(null, data);
        });

    }
});

module.exports = ReindexDaoElastic;