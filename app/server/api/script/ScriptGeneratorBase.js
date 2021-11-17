import { ScriptService } from "./ScriptService";

export default class ScriptGeneratorBase {
    TAB_SPACES = "    ";
    constructor(script) {
        this.usedMethods = {};
        this.functionNames = [];
        this.script = script;
    }

    getCommentCode(comment) {
        return "// " + comment;
    }

    async generateCode() {
        let fullCode = "";
        let service = new ScriptService();
        let context = await service.getContext(this.script.contextCode);
        if (context.data.startCode) {
            fullCode += this.getCommentCode("Code preparation") + "\n\n" + context.data.startCode + "\n";
        }

        // Execution of getStatementCode will collect the variable "this.usedMethods"
        // with all the methods refefenced.
        let mainCode = this.getStatementCode(this.script.mainStatement).join("\n");
        // Get used methods will generate the code for the methods used
        // and they will be returned on top of the source code
        let usedMethodsCode = await this.getUsedMethodsCode();

        fullCode += usedMethodsCode;
        fullCode += mainCode;

        return fullCode;
    }

    getStatementCode = (statement) => {
        switch (statement.type) {
            case "block":
                return this.getStatementBlockCode(statement);
            case "start":
                return this.getStatementStartCode(statement);
            case "end":
                return this.getStatementEndCode(statement);
            case "comment":
                return this.getStatementCommentCode(statement);
            case "condition":
                return this.getStatementConditionCode(statement);
            case "loop":
                return this.getStatementLoopCode(statement);
            case "expressionGroup":
                return this.getStatementExpressionGroupCode(statement);
            default:
                return [];
        }
    };

    getStatementBlockCode = (statement) => {
        let code = [];
        if (statement.nestedStatements) {
            statement.nestedStatements.forEach((nestedStatement) => {
                let nestedCode = this.getStatementCode(nestedStatement);
                code = code.concat(nestedCode);
            });
        }

        return code;
    };

    getStatementCommentCode = (statement) => {
        return ["", this.getCommentCode(statement.comment)];
    };

    getStatementStartCode = (statement) => {
        return ["", this.getCommentCode("Start")];
    };
    getStatementEndCode = (statement) => {
        return ["", this.getCommentCode("End")];
    };

    getStatementExpressionGroupCode = (statement) => {
        let code = [];
        code.push("");
        code.push(this.getCommentCode(statement.name));
        statement.expressions.forEach((expression) => {
            code.push(this.getExpressionCode(expression) + ";");
        });
        return code;
    };
    getRuleCode = (rule) => {
        if (rule.type === "expression") {
            return this.getRuleExpressionCode(rule);
        } else {
            return this.getRuleGroupCode(rule);
        }
    };

    getRuleGroupCode = (rule) => {
        let childrenRules = (rule.rules || []).map((childRule) => {
            return this.getRuleCode(childRule);
        });

        let combinator;
        if (rule.combinator === "all") {
            combinator = " &&\n    ";
        } else {
            combinator = " ||\n    ";
        }
        return "(" + childrenRules.join(combinator) + ")";
    };

    getRuleExpressionCode = (rule) => {
        return this.getExpressionCode(rule.expression);
    };

    getExpressionCode = (expression) => {
        let expressionCode;
        let variablePath = null;
        expression.forEach((member, index) => {
            switch (member.memberType) {
                case "context":
                    expressionCode = member.code;
                    break;
                case "property":
                case "variableContainer":
                    variablePath = null;
                    expressionCode = expressionCode + "?." + member.code;
                    break;
                case "variable":
                    if (!variablePath) {
                        variablePath = [];
                    }
                    variablePath.push(member.code);
                    expressionCode = expressionCode + "?." + member.code;
                    break;
                case "method":
                    expressionCode = this.getMethodCode(member, expressionCode, variablePath);
                    break;
                default:
                    throw Error("Member type " + member.memberType + "not expected");
            }
        });

        return expressionCode;
    };

    getMethodCode = (member, expressionCode, variablePath) => {
        let functionName;
        if (member.code in this.usedMethods) {
            functionName = this.usedMethods[member.code].functionName;
        } else {
            functionName = this.calculateFunctionName(member);
            this.usedMethods[member.code] = {
                functionName: functionName,
            };
        }
        let options = this.getMethodOptions(member, variablePath);
        let methodCode = functionName + "(" + expressionCode + ", " + options + ")";
        if (member.not) {
            methodCode = "!(" + methodCode + ")";
        }
        return methodCode;
    };

    calculateFunctionName = (member) => {
        let methodNameParts = member.code.split(".");
        let functionName = methodNameParts[methodNameParts.length - 1];
        let tryNumber = 0;

        do {
            if (this.functionNames.includes(functionName + (tryNumber > 0 ? "_" + tryNumber.toString() : ""))) {
                tryNumber++;
            } else {
                this.functionNames.push(functionName);
                return functionName;
            }
        } while (true);
    };
}
