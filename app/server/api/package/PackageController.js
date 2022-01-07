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
        this.router.get(
            "/packages/:package_code",
            expressAsyncHandler((req, res, next) => {
                this.getPackage(req, res, next);
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
        return this.router;
    }

    async getPackageList(req, res, next) {
        let service = new PackageService();
        let packageList = await service.getPackageList();
        res.json(new JsonResponse(true, packageList));
    }

    async getPackage(req, res, next) {
        let service = new PackageService();
        let packageData = await service.getPackage(req.params.package_code);
        res.json(new JsonResponse(true, packageData));
    }

    async getPackageVersionList(req, res, next) {
        let service = new PackageVersionService();
        let packageVersions = await service.getPackageVersionList(req.params.package_code);
        res.json(new JsonResponse(true, packageVersions));
    }

    async getPackageVersion(req, res, next) {
        let service = new PackageVersionService();
        let packageVersion = await service.getPackageVersion(req.params.package_code, req.params.version_code);
        res.json(new JsonResponse(true, packageVersion));
    }
}
