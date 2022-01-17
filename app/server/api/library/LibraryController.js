import { BaseController, JsonResponse } from "lisco";
import { LibraryService } from "./LibraryService";
import expressAsyncHandler from "express-async-handler";

export class LibraryController extends BaseController {
    configure() {
        super.configure("library", { service: LibraryService });

        this.router.post(
            "/library/updateAll",
            expressAsyncHandler((res, req, next) => {
                this.updateAll(res, req, next);
            })
        );

        return this.router;
    }

    /**
     * Update all the libreries, removing all of them first and then inserting all.
     */
    async updateAll(request, response, next) {
        try {
            let service = new this.service();
            await service.updateAll(request.body.libraries);

            const jsRes = new JsonResponse(true);
            response.status(200).json(jsRes);
        } catch (e) {
            next(e);
        }
    }
    
}
