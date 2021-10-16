import React from "react";
import Statement from "../Statement";
import { createUseStyles } from "react-jss";

let useStyles = createUseStyles({
  root: {
    display: "inline-flex",
  },
});
export default function StatementBlock({ statement, onChange }) {
  const classes = useStyles();
  const handleOnChange = (index) => (childStatement) => {
    let newStatements = [
      ...statement.statements.slice(0, index),
      childStatement,
      ...statement.statements.slice(index + 1),
    ];
    onChange && onChange({ ...statement, statements: newStatements });
  };

  const renderStatements = (statements) => {
    return statements.map((childStatement, index) => {
      return (
        <tr key={childStatement.id}>
          <td>
            <Statement
              statement={childStatement}
              onChange={handleOnChange(index)}
            />
          </td>
        </tr>
      );
    });
  };

  return (
    <table className={classes.root}>
      <tbody>{renderStatements(statement.statements)}</tbody>
    </table>
  );
}
