import { BaseKnexDao, KnexConnector } from "lisco";

import { v4 as uuid_v4 } from "uuid";

export class SectionDao extends BaseKnexDao {
    tableName = "sections"


    //Overwrite
    save(object) {
        return super.save(object);
    }

    async updateMenu(data){
        let knex = KnexConnector.connection;
        let res = await knex(this.tableName).update("data",JSON.stringify(data)).where("code","menu")
        if (!res || !res.data) {
            throw "No model found";
        }
        return res;
    }

    async getMenu(){
        let knex = KnexConnector.connection;
        let res = await knex.select('data').from(this.tableName).where("code","menu")
        return res;
    }
}