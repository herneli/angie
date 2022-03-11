import { Task } from "./Task";
const { KnexConnector } = require("lisco");
const moment = require("moment");

class PruneChannelsTask extends Task {
    constructor(props) {
        super(props);
    }

    async doLaunch() {
        const { channel_ids } = this.props.prune_channels_options;

        console.debug("Init scheduled task PruneChannelsTask.");

        const knex = KnexConnector.connection;

        if (channel_ids && channel_ids.length > 0) {
            for (const channel_id of channel_ids) {
                console.log("Pruning channel ID: " + channel_id);
                const deploymentOptions = await this.getDeploymentOptions(knex, channel_id);
                if (deploymentOptions) {
                    const { datePruneMetadata, datePruneMessages } = await this.calculatePruneDates(deploymentOptions);
                    if (deploymentOptions.prune_metadata && datePruneMetadata) {
                        console.debug('Pruning channel metadata ' + channel_id + ' before ' + datePruneMetadata);
                        await this.pruneTable(knex, "zstats_" + channel_id, "date_time", datePruneMetadata);    
                    } 
                    if (deploymentOptions.prune_messages && datePruneMessages) {
                        console.debug('Pruning channel messages ' + channel_id + ' before ' + datePruneMessages);
                        await this.pruneTable(knex, "zcheckpoints_" + channel_id, "check_date", datePruneMessages);
                        await this.pruneTable(knex, "zmessages_" + channel_id, "date_reception", datePruneMessages);
                    }                            
                } else {
                    console.error("No deployment options for channel id: " + channel_id);
                }
            }
        }
        console.debug("End scheduled task PruneChannelsTask.");
    }

    async calculatePruneDates(deploymentOptions) {
        let datePruneMetadata = null;
        let datePruneMessages = null;
        if (deploymentOptions) {
            const { days_prune_metadata, days_prune_messages } = deploymentOptions;
            if (days_prune_metadata) {
                datePruneMetadata = moment().subtract(days_prune_metadata, "days").toDate();
            }
            if (days_prune_messages) {
                datePruneMessages = moment().subtract(days_prune_messages, "days").toDate();
            }
        }
        return {
            datePruneMetadata: datePruneMetadata,
            datePruneMessages: datePruneMessages
        }
    }

    async getDeploymentOptions(knex, channelId) {
        let deployment_options = await knex("value").fromRaw("integration_deployment id, jsonb_each(channel_config)").where('key', '=', channelId);
        if (deployment_options && deployment_options.length > 0) {
            return deployment_options[0].value;
        }
        return null;
    }

    async pruneTable(knex, tableName, dateField, datePrune) {
        if (await knex.schema.hasTable(tableName)) {
            await knex(tableName)
                .where((builder) => builder.where(dateField, "<=", datePrune))
                .delete();
        }
    }
}

module.exports = { PruneChannelsTask };
