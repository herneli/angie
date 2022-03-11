import { Task } from "./Task";
const { KnexConnector } = require("lisco");

class RefreshMaterializedViewsTask extends Task {
    constructor(props) {
        super(props);
    }

    async doLaunch() {
        const { materialized_views } = this.props.refresh_materialized_views_options;

        console.debug("Init scheduled task RefreshMaterializedViews.");

        const knex = KnexConnector.connection;

        if (materialized_views && materialized_views.length > 0) {
            for (const materialized_view of materialized_views) {
                await knex.raw("REFRESH MATERIALIZED VIEW " + materialized_view + ";");
                console.debug('Materialized view ' + materialized_view + ' refreshed');
            }
        }
        console.debug("End scheduled task RefreshMaterializedViews.");
    }
}

module.exports= {RefreshMaterializedViewsTask}
