import { BaseController, JsonResponse } from "lisco";
import { PackageService } from "./PackageService";

export class PackageController extends BaseController {
    configure() {
        super.configure("packages", { service: PackageService });
        return this.router;
    }
}
