import React from "react";
import Statement from "../Statement";
import { createUseStyles } from "react-jss";
import { useScriptContext } from "../../ScriptContext";
import { Button } from "antd";
import selectIcon from "./selectIcon.png";
import StatementLabel from "../StatementLabel";
import StatementFinalPoint from "../StatementFinalPoint";
import StatementSelector from "../StatementSelector";
let useStyles = createUseStyles({
    root: {
        display: "inline-flex",
    },
    icon: {
        position: "relative",
        zIndex: 1,
        height: "18px",
        width: "18px",
    },
});
export default function StatementBlock({ statement, variables, onChange }) {
    const classes = useStyles();
    const { manager } = useScriptContext();
    const handleOnChange = (index) => (childStatement) => {
        let newNestedStatements = [
            ...statement.nestedStatements.slice(0, index),
            childStatement,
            ...statement.nestedStatements.slice(index + 1),
        ];
        onChange &&
            onChange({ ...statement, nestedStatements: newNestedStatements });
    };

    const handleOnInsert = (index) => (statementKey) => {
        let selectedStatement = manager.createStatement(statementKey);
        let newStatement = {
            ...statement,
            nestedStatements: [
                ...statement.nestedStatements.slice(0, index),
                selectedStatement,
                ...statement.nestedStatements.slice(
                    index,
                    statement.nestedStatements.length
                ),
            ],
        };
        onChange(newStatement);
    };

    const Selector = ({ onSelect }) => {
        return (
            <StatementSelector onSelect={onSelect}>
                <Button type="text">
                    <img
                        className={classes.icon}
                        src={selectIcon}
                        alt="Select"
                    />
                </Button>
            </StatementSelector>
        );
    };

    const renderStatements = (statements) => {
        return statements.map((childStatement, index) => {
            return (
                <React.Fragment key={childStatement.id}>
                    <tr>
                        <td>
                            <Statement
                                statement={childStatement}
                                variables={{
                                    ...variables,
                                    ...statement.variables,
                                }}
                                onChange={handleOnChange(index)}
                            />
                        </td>
                    </tr>
                    {!statement.main || !(index === statements.length - 1) ? (
                        <tr>
                            <td>
                                <Selector
                                    onSelect={handleOnInsert(index + 1)}
                                />
                            </td>
                        </tr>
                    ) : null}
                </React.Fragment>
            );
        });
    };

    return (
        <table
            id={manager.getStatementDOMId(statement)}
            className={classes.root}
        >
            <tbody>
                {!statement.main ? (
                    <>
                        <tr>
                            <td>
                                <StatementLabel statement={statement} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Selector onSelect={handleOnInsert(0)} />
                            </td>
                        </tr>
                    </>
                ) : null}
                {renderStatements(statement.nestedStatements)}
                <tr>
                    <td>
                        <StatementFinalPoint statement={statement} />{" "}
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
