import { BaseController, JsonResponse } from "lisco";
import { ConfigurationService } from "./ConfigurationService";

import expressAsyncHandler from "express-async-handler";
import { json } from "express";
export class ConfigurationController extends BaseController {
    configure() {
        this.router.get(
            "/configuration/model/:code",
            expressAsyncHandler((req, res, next) => {
                this.getModel(req, res, next);
            })
        );
        this.router.get(
            "/configuration/model/:code/data",
            expressAsyncHandler((req, res, next) => {
                this.getModelDataList(req, res, next);
            })
        );

        this.router.get(
            "/configuration/model/:code/data/:id",
            expressAsyncHandler((req, res, next) => {
                this.getModelData(req, res, next);
            })
        );

        this.router.post(
            "/configuration/model/:code/data",
            expressAsyncHandler((req, res, next) => {
                this.postModel(req, res, next);
            })
        );

        this.router.put(
            "/configuration/model/:code/data/:id",
            expressAsyncHandler((req, res, next) => {
                this.putModel(req, res, next);
            })
        );

        this.router.delete(
            "/configuration/model/:code/data/:id",
            expressAsyncHandler((req, res, next) => {
                this.deleteModelData(req, res, next);
            })
        );

        return this.router;
    }

    async getModel(request, response, next) {
        try {
            const service = new ConfigurationService();
            const model = await service.getModel(request.params.code);

            response.json(new JsonResponse(true, model));
        } catch (ex) {
            next(ex);
        }
    }
    async getModelData(request, response, next) {
        try {
            const service = new ConfigurationService();
            const model = await service.getModelData(request.params.code, request.params.id);

            response.json(new JsonResponse(true, model));
        } catch (ex) {
            next(ex);
        }
    }
    async getModelDataList(request, response, next) {
        try {
            let service = new ConfigurationService();
            let filters = request && request.query && request.query.filters ? JSON.parse(request.query.filters) : {};
            let relations =
                request && request.query && request.query.relations
                    ? JSON.parse("[" + request.query.relations.join(",") + "]")
                    : {};
            let dependencies =
                request && request.query && request.query.dependencies ? JSON.parse(request.query.dependencies) : null;
            let selectQuery = request && request.query && request.query.selectQuery ? request.query.selectQuery : {};
            let modelList = [];

            if (relations.length > 0 && selectQuery) {
                modelList = await service.listWithRelations(
                    request.params.code,
                    filters,
                    filters.start,
                    filters.limit,
                    relations,
                    selectQuery
                );
            } else {
                modelList = await service.list(request.params.code, filters, filters.start, filters.limit);
            }

            modelList = {
                ...modelList,
                data: modelList.data.map((item) => {
                    return { ...item, fullCode: (item.package_code || "") + "." + item.code };
                }),
            };

            response.json(new JsonResponse(true, modelList.data, "", modelList.total));
        } catch (ex) {
            next(ex);
        }
    }

    async postModel(request, response, next) {
        try {
            const service = new ConfigurationService();
            const data = await service.save(request.params.code, request.body);

            response.json(new JsonResponse(true, data));
        } catch (e) {
            next(e);
        }
    }

    async putModel(request, response, next) {
        try {
            const service = new ConfigurationService();
            const data = await service.update(request.params.code, request.params.id, request.body);

            response.json(new JsonResponse(true, data));
        } catch (e) {
            next(e);
        }
    }

    async deleteModelData(request, response, next) {
        try {
            const service = new ConfigurationService();
            const data = await service.delete(request.params.code, request.params.id);

            response.json(new JsonResponse(true, data));
        } catch (e) {
            next(e);
        }
    }
}
