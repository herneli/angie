const TAB_SPACES = "    ";
export default class ScriptGeneratorJavascript {
    constructor(script) {
        this.usedMethods = {};
        this.functionNames = [];
        this.script = script;
    }

    generateCode() {
        return this.getStatementCode(this.script.mainStatement);
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
        // Block start
        if (statement.variables) {
            code.push("//Variables");
            Object.keys(statement.variables || {}).forEach((key) => {
                code.push("let " + key + ";");
            });
        }

        if (statement.nestedStatements) {
            statement.nestedStatements.forEach((nestedStatement) => {
                let nestedCode = this.getStatementCode(nestedStatement);
                code = code.concat(nestedCode);
            });
        }

        return code;
    };

    getStatementCommentCode = (statement) => {
        return ["// " + statement.comment];
    };

    getStatementStartCode = (statement) => {
        return ["// Start"];
    };
    getStatementEndCode = (statement) => {
        return ["// End"];
    };

    getStatementConditionCode = (statement) => {
        let code = [];
        code.push("// " + statement.name);
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
        code = code.concat(trueCode.map((code) => TAB_SPACES + code));
        code.push("}else{");
        let falseCode = this.getStatementCode(faleStatement);
        code = code.concat(falseCode.map((code) => TAB_SPACES + code));
        code.push("}");
        return code;
    };

    getStatementLoopCode = (statement) => {
        let code = [];
        code.push("// " + statement.name);

        let arrayExpression = this.getExpressionCode(statement.arrayExpression);
        code.push(
            arrayExpression + ".forEach(" + statement.itemVariable + " => {"
        );
        code.push(
            TAB_SPACES +
                "context.variables['" +
                statement.itemVariable +
                "'] =  " +
                statement.itemVariable +
                ";"
        );
        let loopCode = this.getStatementCode(statement.nestedStatements[0]);
        code = code.concat(loopCode.map((code) => TAB_SPACES + code));
        code.push("});");
        return code;
    };
    getStatementExpressionGroupCode = (statement) => {
        let code = [];
        code.push("// " + statement.name);
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
        expression.forEach((member, index) => {
            switch (member.memberType) {
                case "context":
                    expressionCode = "context";
                    break;
                case "property":
                case "variable":
                    expression = expressionCode + "?." + member.code;
                    break;
                case "method":
                    expressionCode = this.getMethodCode(member, expression);
                    break;
            }
        });
        return expressionCode;
    };
    getMethodCode = (member, expression) => {
        let functionName;
        if (member.code in this.usedMethods) {
            functionName = this.usedMethods[member.code].functionName;
        } else {
            functionName = this.calculateFunctionName(member);
            this.usedMethods[member.code] = {
                functionName: functionName,
            };
        }
        let options = this.getMethodOptions(member);
        return functionName + "(" + expression + ", " + options + ")";
    };

    calculateFunctionName = (member) => {
        let methodNameParts = member.code.split(".");
        let functionName = methodNameParts[methodNameParts.length - 1];
        let tryNumber = 0;

        do {
            if (
                this.functionNames.includes(
                    functionName +
                        (tryNumber > 0 ? "_" + tryNumber.toString() : "")
                )
            ) {
                tryNumber++;
            } else {
                this.functionNames.push(functionName);
                return functionName;
            }
        } while (true);
    };

    getMethodOptions(member) {
        let options = { params: {} };
        if (member.params) {
            Object.keys(member.params).forEach((param) => {
                if (
                    typeof member.params[param] === "object" &&
                    member.params[param].$exp
                ) {
                    options.params[param] = this.getExpressionCode(
                        member.params[param].$exp
                    );
                } else {
                    options.params[param] = member.params[param];
                }
            });
        }
        return JSON.stringify(options);
    }
}
