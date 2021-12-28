import { BaseKnexDao, KnexConnector, KnexFilterParser } from "lisco";

import { v4 as uuid_v4 } from "uuid";
import moment from "moment";
import lodash from "lodash";
export class IntegrationDao extends BaseKnexDao {
    tableName = "integration";
    deploymentTable = "integration_deployment";

    //Overwrite
    async save(object) {
        if (!object.id) {
            object.id = uuid_v4();
            object.data.id = object.id;
        }

        if (!object.data.created_on) {
            object.data.created_on = moment().toISOString();
        }
        if (!object.data.last_updated) {
            object.data.last_updated = moment().toISOString();
        }

        if (object.deployment_config) {
            await this.updateDeployment(object.id, object.deployment_config);
        }
        delete object.deployment_config;
        
        return super.save(object);
    }

    //Overwrite
    async update(id, object) {
        object.data.last_updated = moment().toISOString();

        if (object.deployment_config) {
            await this.updateDeployment(object.id, object.deployment_config);
        }
        delete object.deployment_config;

        return super.update(id, object);
    }

    //Overwrite
    loadAllData(start, limit) {
        const RELATION_TABLE = this.deploymentTable;
        const columns = [`${this.tableName}.*`, KnexConnector.connection.raw(`json_agg(${RELATION_TABLE})->0 as deployment_config`)];

        return KnexConnector.connection
            .columns(columns)
            .from(this.tableName)
            .leftJoin(RELATION_TABLE, `${this.tableName}.id`, `${RELATION_TABLE}.id`)
            .limit(limit || 10000)
            .groupBy('integration.id')
            .offset(start);
    }

    //Overwrite
    async loadFilteredData(filters, start, limit) {
        let sorts = 1;
        if (filters.sort) {
            sorts = KnexFilterParser.parseSort(filters.sort);
        }

        const RELATION_TABLE = this.deploymentTable;
        const columns = [`${this.tableName}.*`, KnexConnector.connection.raw(`json_agg(${RELATION_TABLE})->0 as deployment_config`)];

        return KnexConnector.connection
            .columns(columns)
            .from(this.tableName)
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .leftJoin(RELATION_TABLE, `${this.tableName}.id`, `${RELATION_TABLE}.id`)
            .orderByRaw(sorts)
            .groupBy('integration.id')
            .limit(limit)
            .offset(start);
    }

    /**
     * Crea una configuración de despliegue con la que "añadir" propiedades a una integración
     * @param {*} id
     * @param {*} object
     * @returns
     */
    async updateDeployment(id, object) {
        const data = await KnexConnector.connection.from(this.deploymentTable).where("id", id);

        if (data && data[0]) {
            return KnexConnector.connection.from(this.deploymentTable).where("id", id).update(object).returning("*");
        } else {
            return KnexConnector.connection.from(this.tabdeploymentTableleName).insert(object).returning("*");
        }
    }
}
