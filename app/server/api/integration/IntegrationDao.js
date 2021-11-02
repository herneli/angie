import { BaseKnexDao, KnexConnector, KnexFilterParser } from "lisco";

import { v4 as uuid_v4 } from "uuid";
import moment from 'moment';
import lodash from 'lodash';
export class IntegrationDao extends BaseKnexDao {
    tableName = "integration"


    //Overwrite
    save(object) {
        if (!object.id) {
            object.id = uuid_v4();
        }

        if (!object.created_on) {
            object.created_on = moment().toISOString();
        }
        if (!object.last_updated) {
            object.last_updated = moment().toISOString();
        }
        return super.save(object);
    }

    update(id, object) {
        object.last_updated = moment().toISOString();
        return super.update(id, object);
    }


    loadAllData(start, limit) {
        const RELATION_TABLE = 'organization'
        const columns = [
            `${this.tableName}.*`,
            {organization_name: `${RELATION_TABLE}.name`}
        ]
        return KnexConnector.connection.columns(columns).from(this.tableName).leftJoin(RELATION_TABLE, `${this.tableName}.organization_id`, `${RELATION_TABLE}.id`).limit(limit || 10000).offset(start)
    }

    async loadFilteredData(filters, start, limit) {
        let sorts = [];
        if (filters.sort) {
            sorts = KnexFilterParser.parseSort(filters.sort);
        }

        const RELATION_TABLE = 'organization'
        const columns = [
            `${this.tableName}.*`,
            {organization_name: `${RELATION_TABLE}.name`}
        ]

        return KnexConnector.connection.columns(columns).from(this.tableName).where((builder) => (
            KnexFilterParser.parseFilters(builder, lodash.omit(filters, ['sort', 'start', 'limit']))
        )).leftJoin(RELATION_TABLE, `${this.tableName}.organization_id`, `${RELATION_TABLE}.id`).orderBy(sorts).limit(limit).offset(start);

    }
}