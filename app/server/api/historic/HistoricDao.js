import { BaseKnexDao, KnexConnector } from "lisco";

export default class HistoricDao extends BaseKnexDao {
    tableName = "historic"


    clearOldHistoric() {
        //TODO
    }

}