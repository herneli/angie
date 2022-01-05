import { BaseKnexDao, KnexConnector } from "lisco";
import { JUMAgent } from ".";

export class JUMAgentDao extends BaseKnexDao {
    tableName = "jum_agent";

    releaseAll() {
        return KnexConnector.connection
            .from(this.tableName)
            .where({ status: JUMAgent.STATUS_ONLINE })
            .update({ status: JUMAgent.STATUS_OFFLINE, last_socket_id: "", current_channels: { list: [] } });
    }

    getRunningAgents() {
        return KnexConnector.connection.from(this.tableName).where({ status: JUMAgent.STATUS_ONLINE });
    }

    async isRunning(id) {
        const agent = await KnexConnector.connection
            .from(this.tableName)
            .where({ status: JUMAgent.STATUS_ONLINE, id: id })
            .first();
        return agent || false;
    }

}
