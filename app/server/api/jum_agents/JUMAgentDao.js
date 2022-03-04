import { BaseKnexDao, KnexConnector } from "lisco";
import { JUMAgent } from ".";

export class JUMAgentDao extends BaseKnexDao {
    tableName = "jum_agent";
    jumAgentCertificatesTableName = "jum_agent_certificate";
    certificatesTableName = "certificate";

    releaseAll() {
        return KnexConnector.connection
            .from(this.tableName)
            .whereIn("status", [JUMAgent.STATUS_ONLINE, JUMAgent.STATUS_INSTALLING])
            .update({ status: JUMAgent.STATUS_OFFLINE, last_socket_id: "", current_channels: { list: [] } });
    }

    getRunningAgents() {
        return KnexConnector.connection.from(this.tableName).where({ status: JUMAgent.STATUS_ONLINE });
    }

    async isRunning(id) {
        const agent = await KnexConnector.connection
            .from(this.tableName)
            .whereIn("status", [JUMAgent.STATUS_ONLINE, JUMAgent.STATUS_INSTALLING])
            .where({ id: id })
            .first();
        return agent || false;
    }

    async getCertificates(objectId) {
        const columns = [`${this.jumAgentCertificatesTableName}.certificate_id`, `${this.certificatesTableName}.*`];
        const resp = await KnexConnector.connection
            .columns(columns)
            .from(this.tableName)
            .innerJoin(
                this.jumAgentCertificatesTableName,
                `${this.tableName}.id`,
                `${this.jumAgentCertificatesTableName}.jum_agent_id`
            )
            .innerJoin(
                this.certificatesTableName,
                `${this.jumAgentCertificatesTableName}.certificate_id`,
                `${this.certificatesTableName}.id`,
            )
            .where(`${this.tableName}.id`, objectId);

        return resp ? resp : [];
    }

    async updateCertificates(objectId, certificate_ids) {
        await KnexConnector.connection.from(this.jumAgentCertificatesTableName).where("jum_agent_id", objectId).delete();
        for (const certificate_id of certificate_ids) {
            await KnexConnector.connection
                .from(this.jumAgentCertificatesTableName)
                .insert({ jum_agent_id: objectId, certificate_id });
        }
    }
}
