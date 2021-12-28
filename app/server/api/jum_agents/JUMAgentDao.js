import { BaseKnexDao, KnexConnector } from "lisco";
import { JUMAgent } from ".";

export class JUMAgentDao extends BaseKnexDao {
    tableName = "jum_agent";

    releaseAll() {
        return KnexConnector.connection
            .from(this.tableName)
            .where({ status: JUMAgent.STATUS_ONLINE })
            .update({ status: JUMAgent.STATUS_OFFLINE });
    }
}
