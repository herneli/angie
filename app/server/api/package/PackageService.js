import { BaseService } from "lisco";
import { PackageDao } from "./PackageDao";

export class PackageService extends BaseService {
    constructor() {
        super(PackageDao);
    }
    async getPackage(code, version) {
        return await this.dao.getPackage(code, version);
    }

    /**
     * Obtencion de un elemento mediante su identificador
     */
     loadById(id) {
        return this.dao.loadByCode(id);
     }
    async getPackageList() {
        return await this.dao.getPackageList();
    }
    async getPackage(code) {
        return await this.dao.getPackage(code);
    }
}
