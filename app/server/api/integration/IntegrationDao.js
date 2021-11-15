import { BaseKnexDao, KnexConnector, KnexFilterParser } from "lisco";

import { v4 as uuid_v4 } from "uuid";
import moment from "moment";
import lodash from "lodash";
export class IntegrationDao extends BaseKnexDao {
    tableName = "integration";

    //Overwrite
    save(object) {
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
        return super.save(object);
    }

    //Overwrite
    update(id, object) {
        object.data.last_updated = moment().toISOString();
        return super.update(id, object);
    }

    //Overwrite
    loadAllData(start, limit) {
        const RELATION_TABLE = "organization";
        const columns = [
            `${this.tableName}.*`,
            // {organization_name: `${RELATION_TABLE}.name`}
        ];
        return KnexConnector.connection
            .columns(columns)
            .from(this.tableName)
            .leftJoin(RELATION_TABLE, `${this.tableName}.organization_id`, `${RELATION_TABLE}.id`)
            .limit(limit || 10000)
            .offset(start);
    }

    //Overwrite
    async loadFilteredData(filters, start, limit) {
        let sorts = 1;
        if (filters.sort) {
            sorts = KnexFilterParser.parseSort(filters.sort);
        }

        const RELATION_TABLE = "organization";
        const columns = [
            `${this.tableName}.*`,
            // {organization_name: `${RELATION_TABLE}.name`}
        ];

        return KnexConnector.connection
            .columns(columns)
            .from(this.tableName)
            .where((builder) =>
                KnexFilterParser.parseFilters(builder, lodash.omit(filters, ["sort", "start", "limit"]))
            )
            .leftJoin(RELATION_TABLE, `${this.tableName}.organization_id`, `${RELATION_TABLE}.id`)
            .orderByRaw(sorts)
            .limit(limit)
            .offset(start);
    }
}
