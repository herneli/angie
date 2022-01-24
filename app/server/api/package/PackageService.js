import { BaseService } from "lisco";
import { PackageDao } from "./PackageDao";
import { PackageVersionService } from "./PackageVersionService";

export class PackageService extends BaseService {
    constructor() {
        super(PackageDao);
    }

    async getPackageList() {
        return await this.dao.getPackageList();
    }
    async getPackage(code) {
        return await this.dao.getPackage(code);
    }

    async createPackage(packageData) {
        await this.dao.save(packageData);
        if (!packageData.remote) {
            let packageVersionService = new PackageVersionService();
            await packageVersionService.createPackageVersion({ code: packageData.code, version: "1.0.0" });
        }
        return true;
    }

    async deletePackage(code) {
        let packageVersionService = new PackageVersionService();
        await packageVersionService.deletePackageVersions(code);
        this.dao.deletePackage(code);
    }
}
