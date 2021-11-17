import ScriptGeneratorBase from "./ScriptGeneratorBase";
import { ScriptService } from "./ScriptService";

export default class ScriptGeneratorGroovy extends ScriptGeneratorBase {
    getStatementConditionCode = (statement) => {
        let code = [];
        code.push("");
        code.push(this.getCommentCode(statement.name));
        let ruleCode = this.getRuleCode(statement.rule);
        code.push("if " + ruleCode + "{");
        let trueStatement;
        let faleStatement;
        statement.nestedStatements.forEach((nestedStatement) => {
            if (nestedStatement.code === "true") {
                trueStatement = nestedStatement;
            } else if (nestedStatement.code === "false") {
                faleStatement = nestedStatement;
            }
        });
        let trueCode = this.getStatementCode(trueStatement);
        code = code.concat(trueCode.map((code) => this.TAB_SPACES + code));
        code.push("} else {");
        let falseCode = this.getStatementCode(faleStatement);
        code = code.concat(falseCode.map((code) => this.TAB_SPACES + code));
        code.push("}");
        return code;
    };

    getStatementLoopCode = (statement) => {
        let code = [];
        code.push("");
        code.push(this.getCommentCode(statement.name));

        let arrayExpression = this.getExpressionCode(statement.arrayExpression);
        code.push("for (" + statement.itemVariable + " in " + arrayExpression + ") {");
        code.push(
            this.TAB_SPACES + "context.variables['" + statement.itemVariable + "'] =  " + statement.itemVariable + ";"
        );
        let loopCode = this.getStatementCode(statement.nestedStatements[0]);
        code = code.concat(loopCode.map((code) => this.TAB_SPACES + code));
        code.push("}");
        return code;
    };

    getMethodOptions(member, variablePath) {
        let params = [];
        if (member.params) {
            params = Object.keys(member.params).map((param) => {
                if (typeof member.params[param] === "object" && member.params[param].$exp) {
                    return '"' + param + '": ' + this.getExpressionCode(member.params[param].$exp);
                } else {
                    return '"' + param + '": ' + JSON.stringify(member.params[param]);
                }
            });
        }
        let variablePathString = "";
        if (variablePath) {
            variablePathString = ", variablePath: [" + variablePath.map((path) => '"' + path + '"').join(", ") + "]";
        }
        let options =
            "[ context: context, params: [" +
            (params.length > 0 ? params.join(", ") : ":") +
            "]" +
            variablePathString +
            "]";
        return options;
    }

    async getUsedMethodsCode() {
        let service = new ScriptService();
        let methodDefinitions = this.getCommentCode("Functions") + "\n";

        for await (const method of Object.keys(this.usedMethods).map((code) => service.getMethod(code))) {
            let methodSourceCode = method.data.sourceCode;

            // Tabulate source code
            methodSourceCode = methodSourceCode
                .split("\n")
                .map((item) => this.TAB_SPACES + item)
                .join("\n");

            // Wraps the source code with the function definition statement
            methodSourceCode =
                "def " +
                this.usedMethods[method.code].functionName +
                "(self, options) {\n" +
                this.TAB_SPACES +
                "context = options.context;\n" +
                this.TAB_SPACES +
                "params = options.params;\n" +
                this.TAB_SPACES +
                "variablePath = options.variablePath;\n" +
                methodSourceCode +
                "\n}\n";

            methodDefinitions = methodDefinitions + "\n" + methodSourceCode;
        }
        return methodDefinitions;
    }
}
