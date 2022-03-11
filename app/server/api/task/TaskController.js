import { BaseController, JsonResponse } from "lisco";
import { TaskService } from "./TaskService";
import expressAsyncHandler from "express-async-handler";

export class TaskController extends BaseController {
    configure() {
        super.configure("task", { service: TaskService });

        this.router.get(
            "/materialized_view",
            expressAsyncHandler((res, req, next) => {
                this.getAllMaterializedViews(res, req, next);
            })
        );

        return this.router;
    }

    /**
     * Get all the materialized view to refresh.
     */
    async getAllMaterializedViews(request, response, next) {
        try {
            const service = new this.service();

            const res = await service.getAllMaterializedViews();
            
            response.json(new JsonResponse(true,res));
        } catch (ex) {
            next(ex);
        }
    }
    
}
