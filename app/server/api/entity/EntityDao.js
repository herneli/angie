// import BaseDao from "../../integration/elastic/BaseDao";

import { BaseKnexDao } from "lisco";


export class EntityDao extends BaseKnexDao {
    constructor() {
        super();

        this.tableName = `zentity`;
    }
}
