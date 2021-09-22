import { Client } from '@elastic/elasticsearch';
import App from '../../../../frontend/src/App';

class ElasticConnector {

    connection = null
    host = null


    getConnection() {
        if (!this.connection) {
            this.connect();
        }
        return this.connection;
    }

    connect(host) {
        this.host = host || App.settings.getConfigValue("rabbitmq:host");
        this.connection = new Client({ node: host || App.settings.getConfigValue('core.application.elastic.host') })
    }

}


export default new ElasticConnector(); //Singleton