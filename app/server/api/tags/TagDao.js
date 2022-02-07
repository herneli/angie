import BaseDao from "../../integration/elastic/BaseDao";

export class TagDao extends BaseDao {
    constructor() {
        super();

        this.tableName = `tags_*`;
    }
}
