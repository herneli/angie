const { v4 } = require("uuid");
import { TaskLogDao } from "../../task_log/TaskLogDao";

export class Task {
    constructor(props) {
        this.props = props;
    }
    async launch() {
        let taskLog = await this.registerStartTask();

        try {
            await this.doLaunch();
            taskLog.error = false;
        } catch (ex) {
            taskLog.error = true;
            throw ex;
        } finally {
            await this.registerEndTask(taskLog);
        }
    }

    async registerStartTask() {
        let task_log = await new TaskLogDao().save({
            id: v4(),
            task_code: this.props.code,
            start_datetime: new Date(),
            end_datetime: null,
            error: null,
        });
        return task_log[0];
    }

    async registerEndTask(taskLog) {
        await new TaskLogDao().update(taskLog.id, { ...taskLog, end_datetime: new Date() });
    }
}
