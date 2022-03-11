import Bree from "bree";
import path from "path";
import { App } from "lisco";
import { TaskService } from "./TaskService";

const SCRIPTS_PATH = path.join(__dirname, "jobs");

class TaskScheduler {
    constructor() {
        this.service = TaskService;
        this.scheduler = new Bree({
            root: false,
            jobs: [],
            errorHandler: (error, workerMetadata) => {
                // workerMetadata will be populated with extended worker information only if
                // Bree instance is initialized with parameter `workerMetadata: true`
                if (workerMetadata.threadId) {
                    console.info(
                        `There was an error while running a worker ${workerMetadata.name} with thread ID: ${workerMetadata.threadId}`
                    );
                } else {
                    console.info(`There was an error while running a worker ${workerMetadata.name}`);
                }
                console.error(error);
            },
        });
    }

    async start() {
        let jobs = await this.getJobs();
        this.scheduler.add(jobs);
        this.scheduler.start();

        //listen on events to update scheduling
        App.events.on("config_deleted_task", async ({ body }) => {
            await this.deschedulingTask(body.id);
        });
        App.events.on("config_saved_task", async ({ body }) => {
            let task = await this.getTaskByCode(body.code);
            await this.schedulingTask(task);
        });
        App.events.on("config_updated_task", async ({ body }) => {
            let task = await this.getTaskByCode(body.code);
            try {
                await this.deschedulingTask(task.id);
            } catch (ex) {
                console.debug("Channel not scheduled already.");
            }
            await this.schedulingTask(task);
        });
    }

    async getJobs() {
        try {
            let service = new this.service();
            let { data: scheduledTasks } = await service.list({});

            if (!scheduledTasks) {
                return [];
            }

            let jobs = [];
            for (const scheduledTask of scheduledTasks) {
                jobs.push(this.getJobFromScheduledTask(scheduledTask));
            }
            return jobs;
        } catch (e) {
            console.error("Error getting jobs to schedule.");
            return [];
        }
    }

    getJobFromScheduledTask(scheduledTask) {
        let job = {
            name: scheduledTask.id,
            path: SCRIPTS_PATH + "/launch-task.js",
            worker: {
                workerData: { ...scheduledTask.data },
            },
        };
        let scheduleExpression = scheduledTask.data.scheduling;
        if (this.isCronValid(scheduleExpression)) {
            job.cron = scheduleExpression;
        } else {
            job.interval = scheduleExpression;
        }
        return job;
    }

    async getTaskByCode(code) {
        try {
            let service = new this.service();
            let { data: scheduledTask } = await service.list({ code: code });
            if (!scheduledTask || scheduledTask.length <= 0) {
                return null;
            }
            return scheduledTask[0];
        } catch (e) {
            console.error("Error getting job by id.");
            return null;
        }
    }

    async schedulingTask(task) {
        if (task.data.enabled) {
            this.scheduler.add(this.getJobFromScheduledTask(task));
            this.scheduler.start(task.id);
        }
    }

    async deschedulingTask(taskId) {
        await this.scheduler.stop(taskId);
        await this.scheduler.remove(taskId);
    }

    isCronValid(expression) {
        var cronregex = new RegExp(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/);
        return cronregex.test(expression);
    }
}

export default new TaskScheduler();
