import { Utils, BaseService } from "lisco";
import { PackageDao } from "./PackageDao";

export class PackageService extends BaseService {
    constructor() {
        super(PackageDao);
    }
}
