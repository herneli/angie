import { BaseService } from "lisco";
import { TaskLogDao } from "./TaskLogDao";

export class TaskLogService extends BaseService {
    constructor() {
        super(TaskLogDao);
    }
}
