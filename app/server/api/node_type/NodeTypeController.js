import { BaseController, JsonResponse } from "lisco";
import lodash from "lodash";
import { NodeTypeService } from "./NodeTypeService";

const asyncHandler = require("express-async-handler");

export class NodeTypeController extends BaseController {
    configure() {
        super.configure("node_type", { service: NodeTypeService });
        return this.router;
    }
}
