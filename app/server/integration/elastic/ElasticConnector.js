import { Client } from "@elastic/elasticsearch";

class ElasticConnector {
    connection = null;
    host = null;

    getConnection() {
        if (!this.connection) {
            this.connect();
        }
        return this.connection;
    }

    connect(host) {
        this.host = host || process.env.ELASTIC_URL;
        this.connection = new Client({ node: host });
    }
}

export default new ElasticConnector(); //Singleton
