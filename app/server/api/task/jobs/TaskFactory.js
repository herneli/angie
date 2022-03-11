const { PruneChannelsTask } = require("./PruneChannelsTask");
const { RefreshMaterializedViewsTask } = require("./RefreshMaterializedViewsTask");
const { RefreshUsersTask } = require("./RefreshUsersTask");

export class TaskFactory {
    static getInstance(workerData) {
        switch (workerData.type) {
            case "prune_channels":
                return  new PruneChannelsTask(workerData);
            case "refresh_materialized_views":
                return new RefreshMaterializedViewsTask(workerData);
            case "refresh_users":
                return new RefreshUsersTask(workerData);
            default:
                console.error("Task type not found.");
                return null;
        }
    }
}