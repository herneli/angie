
var amqp = require('amqplib/callback_api');

var RMQConnector = Class.extend({
    host: null,

    retries: 0,
    maxRetries: 10,

    init: function (host) {
        this.retries = 0;
        this.host = host || global.settings.getConfigValue("rabbitmq:host");
    },


    connect: function (callback) {
        var self = this;
        amqp.connect(this.host, function (error0, connection) {
            if (error0) {
                if (self.retries >= self.maxRetries) {

                    console.error("Perdida la conexión con RabbitMQ y sobrepasado el máximo de reintentos.");
                    return process.exit(1);
                }
                setTimeout(function () {
                    self.reconnect();
                }, 1000);
                return callback('RabbitMQ Connection failed. Retrying.');
            }
            console.log('Succesfully connected to rabbitmq');

            connection.on('error', function (e) {
                if (e && e.code && e.code == 'ECONNRESET') {
                    if (self.retries >= self.maxRetries) {

                        console.error("Perdida la conexión con RabbitMQ y sobrepasado el máximo de reintentos.");
                        return process.exit(1);
                    }
                    setTimeout(function () {
                        self.reconnect();
                    }, 1000);
                    console.error('Se ha perdido la conexión con RabbitMQ. Reintentando de forma automatica.');
                    return;
                }
                console.error(e);
            });

            global.amqp = connection;

            if (callback) return callback(null, connection);
        });
    },

    reconnect: function (callback) {
        this.retries++;
        this.connect(function (err, connection) {
            if (err) {
                return console.error(err);
            }
            
            //Si no hay error se desencadena el reconnected
            setTimeout(function () {
                global.eventHandler.speak({
                    message: '#rabbitmq_reconnected#'
                }, null, true);
            }, 2000);

            if (callback) return callback(null, connection);
        });
    }
});


module.exports = RMQConnector;