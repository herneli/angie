import { BaseKnexDao, KnexConnector } from "lisco";

export class HistoricDao extends BaseKnexDao {
    tableName = "historic"


    clearOldHistoric() {
        //TODO
    }

}