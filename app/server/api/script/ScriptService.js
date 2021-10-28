import { Utils, BaseService } from "lisco";
import { ScriptDao } from "./ScriptDao";
import newScript from "./newScript.json";
import ScriptGeneratorJavascript from "./ScriptGeneratorJavascript";

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

    async getScript(code) {
        let script = await this.dao.getScriptConfig("script", code);
        if (!script) {
            return { document_type: "script", code: code, data: newScript };
        } else {
            return script;
        }
    }

    async saveScript(code, data) {
        let saveResults = await this.dao.saveScriptConfig("script", code, data);
        if (saveResults) {
            return saveResults[0];
        } else {
            throw Error("Error saving Script");
        }
    }

    async generateCode(script) {
        let generator = new ScriptGeneratorJavascript(script);
        let code = generator.generateCode();
        console.log(code.join("\n"));
    }
}
