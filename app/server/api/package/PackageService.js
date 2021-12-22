import { Utils, BaseService } from "lisco";
import { PackageDao } from "./PackageDao";

export class PackageService extends BaseService {
    constructor() {
        super(PackageDao);
    }
    async getPackage(code, version) {
        return await this.dao.getPackage(code, version);
    }
}
