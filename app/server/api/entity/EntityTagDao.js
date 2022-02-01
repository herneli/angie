import BaseDao from "../../integration/elastic/BaseDao";

export class EntityDao extends BaseDao {
    constructor() {
        super();

        this.tableName = `tags_*`;
    }
}
