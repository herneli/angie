import { BaseService } from "lisco";
import { TaskDao } from "./TaskDao";

export class TaskService extends BaseService {
    constructor() {
        super(TaskDao);
    }

    async getAllMaterializedViews() {
        return await this.dao.getAllMaterializedViews();
    }
}
