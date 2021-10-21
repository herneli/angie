import { Utils, BaseService } from "lisco";
import { ScriptDao } from "./ScriptDao";

export class ScriptService extends BaseService {
    constructor() {
        super(ScriptDao);
    }

    async getObjectMembers({
        type,
        language,
        excludeProperties,
        excludeMethods,
    }) {
        let properties = [];
        let methods = [];

        if (!excludeProperties) {
            let objectData = await this.dao.getObjectData(type);
            if (objectData && objectData.data && objectData.data.properties) {
                properties = objectData.data.properties;
            }
        }

        if (!excludeMethods) {
            const methodsDb = await this.dao.getMethods(type, language);

            methods = methodsDb.map((method) => {
                return method.data;
            });
        }
        return { properties, methods };
    }
}
