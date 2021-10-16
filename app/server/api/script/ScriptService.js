import { Utils, BaseService } from "lisco";
import { ScriptDao } from "./ScriptDao";

export class ScriptService extends BaseService {
    constructor() {
        super(ScriptDao);
    }

    getObjectMembers(params) {
        return this.dao.getObjectMembers(params);
    }
}
