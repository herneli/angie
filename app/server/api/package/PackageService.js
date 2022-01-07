import { BaseService } from "lisco";
import { PackageDao } from "./PackageDao";

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
}
