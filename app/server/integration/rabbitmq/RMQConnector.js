
import * as amqp from 'amqplib/callback_api'
import { App } from 'lisco';


class RMQConnector {

    connection = null;
    host = null
    retries = 0
    maxRetries = 10


    getConnection() {
        if (!this.connection) {
            this.connect();
        }
        return this.connection;
    }

    connect(host) {
        this.retries = 0;
        this.host = host || App.settings.getConfigValue("rabbitmq:host");
        
        return new Promise((resolve, reject) => {
            amqp.connect(this.host, (error0, connection) => {
                if (error0) {
                    if (self.retries >= self.maxRetries) {
                        console.error("Perdida la conexión con RabbitMQ y sobrepasado el máximo de reintentos.");
                        return process.exit(1);
                    }
                    setTimeout(() => {
                        self.reconnect();
                    }, 1000);
                    return reject('RabbitMQ Connection failed. Retrying.');
                }
                console.log('Succesfully connected to rabbitmq');

                connection.on('error', (e) => {
                    if (e && e.code && e.code == 'ECONNRESET') {
                        if (self.retries >= self.maxRetries) {

                            console.error("Perdida la conexión con RabbitMQ y sobrepasado el máximo de reintentos.");
                            return process.exit(1);
                        }
                        setTimeout(() => {
                            self.reconnect();
                        }, 1000);

                        console.error('Se ha perdido la conexión con RabbitMQ. Reintentando de forma automatica.');
                        return;
                    }
                    console.error(e);
                });

                this.connection = connection;

                return resolve(connection);
            });
        });
    }

    reconnect() {
        return new Promise((resolve, reject) => {
            this.retries++;
            this.connect((err, connection) => {
                if (err) {
                    return console.error(err);
                }

                //Si no hay error se desencadena el reconnected
                setTimeout(function () {
                    App.events.emit('#rabbitmq_reconnected#');
                }, 2000);

                if (callback) return callback(null, connection);
            });
        });
    }
}


export default new RMQConnector(); //Singleton