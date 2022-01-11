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

        const config = object.deployment_config;

        if (config) {
            await this.updateDeployment(object.id, config);
        }

        const [obj] = await super.save(lodash.omit(object, ["deployment_config"]));
        obj.deployment_config = config;
        return this.applyIntegrationDeployment([obj]);
    }

    //Overwrite
    async update(id, object) {
        object.data.last_updated = moment().toISOString();
        const config = object.deployment_config;

        if (config) {
            await this.updateDeployment(object.id, config);
        }

        const [obj] = await super.update(id, lodash.omit(object, ["deployment_config"]));
        obj.deployment_config = config;
        return this.applyIntegrationDeployment([obj]);
    }

    async loadById(objectId) {
        const RELATION_TABLE = this.deploymentTable;
        const columns = [
            `${this.tableName}.*`,
            KnexConnector.connection.raw(`json_agg(${RELATION_TABLE})->0 as deployment_config`),
        ];

        let res = await KnexConnector.connection
            .columns(columns)
            .from(this.tableName)
            .leftJoin(RELATION_TABLE, `${this.tableName}.id`, `${RELATION_TABLE}.id`)
            .where("integration.id", objectId)
            .groupBy("integration.id");

        res = this.applyIntegrationDeployment(res);
        if (res && res[0]) {
            return res[0];
        }
        return null;
    }

    async delete(objectId) {
        await super.delete(objectId);

        //Eliminar también la configuración de despliegues.
        await KnexConnector.connection.from(this.deploymentTable).where("id", objectId).delete();
    }

    //Overwrite
    async loadAllData(start, limit) {
        const RELATION_TABLE = this.deploymentTable;
        const columns = [
            `${this.tableName}.*`,
            KnexConnector.connection.raw(`json_agg(${RELATION_TABLE})->0 as deployment_config`),
        ];

        const res = await KnexConnector.connection
            .columns(columns)
            .from(this.tableName)
            .leftJoin(RELATION_TABLE, `${this.tableName}.id`, `${RELATION_TABLE}.id`)
            .limit(limit || 10000)
            .groupBy("integration.id")
            .offset(start);

        return this.applyIntegrationDeployment(res);
    }

    //Overwrite
    async loadFilteredData(filters, start, limit) {
        let sorts = 1;
        if (filters.sort) {
            sorts = KnexFilterParser.parseSort(filters.sort);
        }

        const RELATION_TABLE = this.deploymentTable;
        const columns = [
            `${this.tableName}.*`,
            KnexConnector.connection.raw(`json_agg(${RELATION_TABLE})->0 as deployment_config`),
        ];

        const res = await KnexConnector.connection
            .columns(columns)
            .from(this.tableName)
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .leftJoin(RELATION_TABLE, `${this.tableName}.id`, `${RELATION_TABLE}.id`)
            .orderByRaw(sorts)
            .groupBy("integration.id")
            .limit(limit)
            .offset(start);

        return this.applyIntegrationDeployment(res);
    }

    /**
     * Crea una configuración de despliegue con la que "añadir" propiedades a una integración
     * @param {*} id
     * @param {*} object
     * @returns
     */
    async updateDeployment(id, object) {
        const data = await KnexConnector.connection.from(this.deploymentTable).where("id", id);

        object.last_deployment_date = moment().toISOString();

        if (data && data[0]) {
            return KnexConnector.connection.from(this.deploymentTable).where("id", id).update(object).returning("*");
        } else {
            return KnexConnector.connection
                .from(this.deploymentTable)
                .insert({ ...object, id: id })
                .returning("*");
        }
    }

    /**
     * Metodo que devuelve a la integracion y sus canales los datos de despliegue "locales"
     * @param {*} integrations
     * @returns
     */
    applyIntegrationDeployment(integrations) {
        for (const integ of integrations) {
            integ.data.deployment_config = integ.deployment_config;
            if (integ.data.channels && integ.deployment_config) {
                for (const chann of integ.data.channels) {
                    chann.deployment_options =
                        integ.deployment_config.channel_config && integ.deployment_config.channel_config[chann.id];
                }
            }
        }
        return integrations;
    }
}
