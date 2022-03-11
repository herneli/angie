import { BaseController } from "lisco";
import { TaskLogService } from "./TaskLogService";

export class TaskLogController extends BaseController {
    configure() {
        super.configure("task_log", { service: TaskLogService });
        return this.router;
    }  
}
