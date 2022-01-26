import { BaseController, JsonResponse } from "lisco";
import { PackageService } from "./PackageService";
import { PackageVersionService } from "./PackageVersionService";
import expressAsyncHandler from "express-async-handler";

export class PackageController extends BaseController {
    configure() {
        this.router.get(
            "/packages",
            expressAsyncHandler((req, res, next) => {
                this.getPackageList(req, res, next);
            })
        );
        this.router.post(
            "/packages",
            expressAsyncHandler((req, res, next) => {
                this.createPackage(req, res, next);
            })
        );
        this.router.get(
            "/packages/remote_list",
            expressAsyncHandler((req, res, next) => {
                this.getRemoteList(req, res, next);
            })
        );
        this.router.get(
            "/packages/:package_code",
            expressAsyncHandler((req, res, next) => {
                this.getPackage(req, res, next);
            })
        );

        this.router.delete(
            "/packages/:package_code",
            expressAsyncHandler((req, res, next) => {
                this.deletePackage(req, res, next);
            })
        );
        this.router.get(
            "/packages/:package_code/versions",
            expressAsyncHandler((req, res, next) => {
                this.getPackageVersionList(req, res, next);
            })
        );

        this.router.get(
            "/packages/:package_code/versions/:version_code",
            expressAsyncHandler((req, res, next) => {
                this.getPackageVersion(req, res, next);
            })
        );

        this.router.delete(
            "/packages/:package_code/versions/:version_code",
            expressAsyncHandler((req, res, next) => {
                this.deletePackageVersion(req, res, next);
            })
        );
        this.router.get(
            "/packages/:package_code/versions/:version_code/publish",
            expressAsyncHandler((req, res, next) => {
                this.publishVersion(req, res, next);
            })
        );
        this.router.get(
            "/packages/:package_code/versions/:version_code/import",
            expressAsyncHandler((req, res, next) => {
                this.importVersion(req, res, next);
            })
        );

        this.router.post(
            "/packages/:package_code/versions/:version_code/copy",
            expressAsyncHandler((req, res, next) => {
                this.copyVersion(req, res, next);
            })
        );
        this.router.get(
            "/packages/:package_code/check_remote_status",
            expressAsyncHandler((req, res, next) => {
                this.updateRemoteStatus(req, res, next);
            })
        );

        return this.router;
    }

    async getPackageList(req, res, next) {
        try {
            let service = new PackageService();
            let packageList = await service.getPackageList();
            res.json(new JsonResponse(true, packageList));
        } catch (e) {
            next(e);
        }
    }

    async getPackage(req, res, next) {
        try {
            let service = new PackageService();
            let packageData = await service.getPackage(req.params.package_code);
            res.json(new JsonResponse(true, packageData));
        } catch (e) {
            next(e);
        }
    }

    async deletePackage(req, res, next) {
        try {
            let service = new PackageService();
            let packageData = await service.deletePackage(req.params.package_code);
            res.json(new JsonResponse(true, packageData));
        } catch (e) {
            next(e);
        }
    }

    async createPackage(req, res, next) {
        try {
            let service = new PackageService();
            let saveResponse = await service.createPackage(req.body);
            res.json(new JsonResponse(true, saveResponse));
        } catch (e) {
            next(e);
        }
    }

    async getPackageVersionList(req, res, next) {
        try {
            let service = new PackageVersionService();
            let packageVersions = await service.getPackageVersionList(req.params.package_code);
            res.json(new JsonResponse(true, packageVersions));
        } catch (e) {
            next(e);
        }
    }

    async getPackageVersion(req, res, next) {
        try {
            let service = new PackageVersionService();
            let packageVersion = await service.getPackageVersion(req.params.package_code, req.params.version_code);
            res.json(new JsonResponse(true, packageVersion));
        } catch (e) {
            next(e);
        }
    }

    async deletePackageVersion(req, res, next) {
        try {
            let service = new PackageVersionService();
            let packageVersion = await service.deletePackageVersion(req.params.package_code, req.params.version_code);
            res.json(new JsonResponse(true, packageVersion));
        } catch (e) {
            next(e);
        }
    }

    async getRemoteList(req, res, next) {
        try {
            let service = new PackageVersionService();
            let remoteList = await service.getRemoteList();
            res.json(new JsonResponse(true, remoteList));
        } catch (e) {
            next(e);
        }
    }

    async publishVersion(req, res, next) {
        try {
            let service = new PackageVersionService();
            let publishResponse = await service.publishVersion(req.params.package_code, req.params.version_code);
            res.json(new JsonResponse(true, publishResponse));
        } catch (e) {
            next(e);
        }
    }
    async importVersion(req, res, next) {
        try {
            let service = new PackageVersionService();
            let importResponse = await service.importAngiePackage(req.params.package_code, req.params.version_code);
            res.json(new JsonResponse(true, importResponse));
        } catch (e) {
            next(e);
        }
    }

    async copyVersion(req, res, next) {
        try {
            let service = new PackageVersionService();
            let copyResponse = await service.copyVersion(req.params.package_code, req.params.version_code, req.body);
            res.json(new JsonResponse(true, copyResponse));
        } catch (e) {
            next(e);
        }
    }
    async updateRemoteStatus(req, res, next) {
        try {
            let service = new PackageVersionService();
            let checkResponse = await service.updateRemoteStatus(req.params.package_code);
            res.json(new JsonResponse(true, checkResponse.branchSummary));
        } catch (e) {
            next(e);
        }
    }
}
