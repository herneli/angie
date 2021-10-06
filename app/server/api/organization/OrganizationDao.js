import { BaseKnexDao, KnexConnector } from "lisco";

import { v4 as uuid_v4 } from "uuid";

export class OrganizationDao extends BaseKnexDao {
    tableName = "organization"

}