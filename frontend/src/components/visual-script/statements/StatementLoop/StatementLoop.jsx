import React from "react";
import { createUseStyles } from "react-jss";
import { useScriptContext } from "../../ScriptContext";
import Statement from "../Statement";
import StatementFinalPoint from "../StatementFinalPoint";
import registry from ".";
import Expression from "../../expressions/Expression";
import T from "i18n-react";
import { Input, Space } from "antd";
import StatementBox from "../StatementBox";
const useStyles = createUseStyles({
    table: {
        borderCollapse: "separate",
        borderSpacing: "0px",
        display: "inline-block",
        "& td": {
            verticalAlign: "top",
        },
    },
    box: {
        margin: "5px 10px 5px 10px",
        padding: "2px 10px 5px 20px",
        minWidth: 450,
        borderRadius: 0,
        background: "rgba(158, 158, 158, 0.15)",
        textAlign: "left",
        boxShadow: "0 0 2px rgba(0, 0, 0, 0), 0 2px 4px rgba(0, 0, 0, 0.33)",
        display: "inline-block",
    },
    title: {
        display: "inline-block",
        lineHeight: "32px",
        color: "gray",
    },
    titleIcon: {
        fontSize: 18,
        marginRight: 10,
        position: "relative",
        top: 4,
    },

    removeButton: {
        marginLeft: 10,
        float: "right",
        padding: 10,
    },
    variables: {
        verticalAlign: "bottom",
    },
    toolbar: {
        fontSize: 14,
        marginBottom: 8,
    },
    footer: {
        display: "table",
        fontSize: 14,
        marginTop: 5,
        width: "100%",
    },
    into: {
        margin: "0 30px 5px 30px",
        color: "dodgerblue",
    },
    itemName: {},
    icon: {
        color: "gray",
        marginRight: "10px",
        fontSize: 14,
        position: "relative",
        top: 4,
    },
    expressionAssignment: {
        display: "flex",
    },
});
export default function StatementLoop({ statement, variables, onChange, onDelete }) {
    const { manager } = useScriptContext();
    const statementId = manager.getStatementDOMId(statement);
    const classes = useStyles();

    const handleOnChange = (field) => (value) => {
        onChange({ ...statement, [field]: value });
    };
    const handleOnChangeChild = (index) => (childStatement) => {
        let newNestedStatements = [
            ...statement.nestedStatements.slice(0, index),
            childStatement,
            ...statement.nestedStatements.slice(index + 1),
        ];
        onChange && onChange({ ...statement, nestedStatements: newNestedStatements });
    };

    const calculateLoopVariable = () => {
        let exp = statement.arrayExpression;
        if (exp.length > 1 && exp[exp.length - 1].type.type === "array") {
            return {
                [statement.itemVariable]: {
                    memberType: "variable",
                    code: statement.itemVariable,
                    name: statement.itemVariable,
                    type: exp[exp.length - 1].type.items,
                },
                [statement.itemVariable + "Index"]: {
                    memberType: "variable",
                    code: statement.itemVariable + "Index",
                    name: statement.itemVariable + "Index",
                    type: exp[exp.length - 1].type.items,
                },
            };
        } else {
            return {};
        }
    };

    const renderNestedStatements = () => {
        return statement.nestedStatements.map((childStatement, index) => {
            return (
                <td key={childStatement.id}>
                    <Statement
                        statement={childStatement}
                        variables={{ ...variables, ...calculateLoopVariable() }}
                        onChange={handleOnChangeChild(index)}
                    />
                </td>
            );
        });
    };

    return (
        <table className={classes.table}>
            <tbody>
                <tr>
                    <td id={statementId + "-loop-back"}>
                        <StatementBox
                            statement={statement}
                            variables={variables}
                            iconPath={registry.iconPath}
                            onChange={onChange}
                            onDelete={onDelete}>
                            <div className={classes.expressionAssignment}>
                                <Space>
                                    <span>{T.translate("visual_script.loop_repeat")}</span>
                                    <Expression
                                        expression={statement.arrayExpression}
                                        variables={variables}
                                        expectedType={{
                                            type: "array",
                                            items: { type: "$any" },
                                        }}
                                        onChange={handleOnChange("arrayExpression")}
                                    />
                                    <span>{T.translate("visual_script.loop_to_variable")}</span>

                                    <Input
                                        value={statement.itemVariable}
                                        onChange={(e) => handleOnChange("itemVariable")(e.target.value)}
                                    />
                                </Space>
                            </div>
                        </StatementBox>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table className={classes.table}>
                            <tbody>
                                <tr>{renderNestedStatements()}</tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <StatementFinalPoint statement={statement} />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
