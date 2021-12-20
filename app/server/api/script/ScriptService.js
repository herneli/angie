import { Utils, BaseService } from "lisco";
import { ScriptDao } from "./ScriptDao";
import mainStatement from "./default_main_statement.json";
import ScriptGeneratorJavascript from "./ScriptGeneratorJavascript";
import { runCode } from "./javascriptVM";
import ScriptGeneratorGroovy from "./ScriptGeneratorGroovy";
import { unpackFullCode } from "./utils";

export class ScriptService extends BaseService {
    constructor() {
        super(ScriptDao);
    }

    async getObjectMembers({ type, language, excludeProperties, excludeMethods, packages = null, recursive = false }) {
        let properties = [];
        let methods = [];
        let childrenObjects = {};

        if (!excludeProperties) {
            properties = await this.getProperties({ type, recursive, childrenObjects, packages });
        }

        if (!excludeMethods) {
            const methodsDb = await this.dao.getMethods({ type, language, packages });

            methods = methodsDb.map((method) => {
                return method.data;
            });
        }

        return { properties, methods, childrenObjects };
    }

    async getProperties({ type, recursive = false, childrenObjects = {}, packages = null }) {
        let properties = [];
        if (type.type === "object") {
            let objectData = await this.dao.getObjectData({ type, packages });
            if (objectData && objectData.data && objectData.data.properties) {
                properties = objectData.data.properties;
                if (!(type.objectCode in childrenObjects)) {
                    childrenObjects[type.objectCode] = properties;
                }
                if (recursive) {
                    for (const property of properties) {
                        if (property.type.type === "object") {
                            await this.getProperties({ type: property.type, recursive, childrenObjects, packages });
                        } else if (
                            property.type.type === "array" &&
                            property.type.items &&
                            property.type.items.type === "object"
                        ) {
                            await this.getProperties({
                                type: property.type.items,
                                recursive,
                                childrenObjects,
                                packages,
                            });
                        }
                    }
                }
            }
            if (!(type.objectCode in childrenObjects)) {
                childrenObjects[type.objectCode] = properties;
            }
        }
        return properties;
    }

    async getContext(contextCode, packages) {
        let [packageCode, code] = unpackFullCode(contextCode);
        return await this.dao.getScriptConfig("context", packageCode, code, packages);
    }

    async newScript(contextCode) {
        let context = await this.getContext(contextCode);
        context = context && context.data;
        return {
            contextCode: contextCode,
            contextMember: {
                memberType: "context",
                code: "context",
                name: "context",
                type: context ? context.type : "context_type",
            },
            language: context ? context.language : "context_language",
            mainStatement: mainStatement,
        };
    }

    async getScript(code) {
        let script = await this.dao.getScriptConfig("script", code);
        if (!script) {
            return {
                document_type: "script",
                code: code,
                data: { ...(await this.newScript("context_test_groovy")), code: code },
            };
        } else {
            return script;
        }
    }

    async getMethod(code) {
        return await this.dao.getScriptConfig("method", code);
    }

    async saveScript(code, data) {
        let saveResults = await this.dao.saveScriptConfig("script", code, data);
        if (saveResults) {
            return saveResults[0];
        } else {
            throw Error("Error saving Script");
        }
    }

    getGenerator(script) {
        switch (script.language) {
            case "javascript":
                return new ScriptGeneratorJavascript(script);
            case "groovy":
                return new ScriptGeneratorGroovy(script);
            default:
                throw Error("Language " + script.language + " not expected");
        }
    }
    async generateCode(script) {
        let generator = this.getGenerator(script);
        let code = generator.generateCode();
        return code;
    }

    async executeCode(scriptCode) {
        let script = await this.dao.getScriptConfig("script", scriptCode);
        let generator = this.getGenerator(script.data);

        let code = await generator.generateCode();
        runCode(code);
        return code;
    }
}
