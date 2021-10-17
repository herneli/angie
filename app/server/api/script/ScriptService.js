import { Utils, BaseService } from "lisco";
import { ScriptDao } from "./ScriptDao";

export class ScriptService extends BaseService {
    constructor() {
        super(ScriptDao);
    }

    getObjectMembers({ type, language }) {
        const objectData = this.dao.getObjectData(type);
        const methods = this.dao.getMethods(type, language);

        return Promise.all([objectData, methods]).then((values) => {
            let properties = values[0].data.properties;

            let methods = values[1].map((method) => {
                return method.data;
            });
            return { properties, methods };
        });
    }
}
