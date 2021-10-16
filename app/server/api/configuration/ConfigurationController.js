import { BaseController, JsonResponse } from "lisco";
import { ConfigurationService } from "./ConfigurationService";
export class ConfigurationController extends BaseController {
    configure() {
        this.router.get("/configuration/model/:code", (req, res, next) => {
            this.getModel(req, res, next);
        });
        this.router.get("/configuration/model/:code/data", (req, res, next) => {
            this.getModelDataList(req, res, next);
        });

        this.router.get(
            "/configuration/model/:code/data/:id",
            (req, res, next) => {
                this.getModelData(req, res, next);
            }
        );

        this.router.post(
            "/configuration/model/:code/data",
            (req, res, next) => {
                this.postModel(req, res, next);
            }
        );

        this.router.put(
            "/configuration/model/:code/data/:id",
            (req, res, next) => {
                this.putModel(req, res, next);
            }
        );

        this.router.delete(
            "/configuration/model/:code/data/:id",
            (req, res, next) => {
                this.deleteModelData(req, res, next);
            }
        );

        return this.router;
    }

    getModel(request, response) {
        let service = new ConfigurationService();
        service
            .getModel(request.params.code)
            .then((model) => response.json(new JsonResponse(true, model)));
    }
    getModelData(request, response) {
        let service = new ConfigurationService();
        service
            .getModelData(request.params.code, request.params.id)
            .then((model) => response.json(new JsonResponse(true, model)));
    }
    getModelDataList(request, response) {
        let service = new ConfigurationService();
        service
            .getModelDataList(request.params.code)
            .then((modelList) =>
                response.json(new JsonResponse(true, modelList))
            );
    }

    postModel(request, response) {
        let service = new ConfigurationService();
        service
            .createModelData(request.params.code, request.body)
            .then((model) => response.json(new JsonResponse(true, model[0])));
    }

    putModel(request, response) {
        let service = new ConfigurationService();
        service
            .updateModelData(
                request.params.code,
                request.params.id,
                request.body
            )
            .then((model) => response.json(new JsonResponse(true, model[0])));
    }
    deleteModelData(request, response) {
        let service = new ConfigurationService();
        service
            .deleteModelData(request.params.code, request.params.id)
            .then((model) => response.json(new JsonResponse(true, "done")));
    }
}
