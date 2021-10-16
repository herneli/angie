import React from "react";
import AutosizeInput from "react-input-autosize";
import { createUseStyles } from "react-jss";
const useStyles = createUseStyles({
  editor: {
    margin: "0 5px",
    "& input": {
      textAlign: "center",
      background: "transparent",
      border: 0,
      borderBottom: "1px dotted",
      fontSize: "14px",
      outline: "none",
    },
  },
  editorDisplay: {
    margin: "0 5px",
    textAlign: "center",
    background: "transparent",
    border: 0,
    borderBottom: "1px dotted",
    fontSize: "14px",
    outline: "none",
  },
});
const MAX_STRING_SIZE = 40;

export default function ParamEditor({
  definition,
  value,
  onClickEdit,
  onChange,
}) {
  const classes = useStyles();
  const handleOnChange = (e) => {
    let value = e.target.value;
    if (definition.type === "integer") {
      value = parseInt(value);
    } else if (definition.type === "number") {
    }
    onChange && onChange(value);
  };

  const getValue = () => {
    if (definition.type === "integer" || definition.type === "number") {
      if (value === 0) {
        return 0;
      } else {
        return value || 0;
      }
    } else {
      return value || "";
    }
  };

  const renderArray = () => {
    value = value || [];
    switch (definition.itemsType) {
      case "integer":
      case "number":
      case "date":
      case "string":
        value = value.map((itemValue) => {
          return String(itemValue);
        });
        value = value.join(", ");
        let valueLength = value.length;
        value = value.substring(0, MAX_STRING_SIZE);
        if (valueLength > MAX_STRING_SIZE) {
          value = value + "...";
        }
        return (
          <span className={classes.editorDisplay} onClick={onClickEdit}>
            [{value}]
          </span>
        );
      case "boolean":
        let editorValue = value.toString();
        return (
          <span className={classes.editorDisplay} onClick={onClickEdit}>
            {editorValue}
          </span>
        );
      default:
        return (
          <span className={classes.editorDisplay} onClick={onClickEdit}>
            Edit
          </span>
        );
    }
  };
  const renderObject = () => {
    return (
      <span className={classes.editorDisplay} onClick={onClickEdit}>
        {"{"}obj{"}"}
      </span>
    );
  };
  const renderDefault = () => {
    return (
      <span className={classes.editorDisplay} onClick={onClickEdit}>
        Edit
      </span>
    );
  };

  try {
    let type = "text";
    let minWidth = 10;
    if (definition.type === "date") {
      type = "date";
      minWidth = 130;
    }
    if (definition.type === "number") {
      type = "number";
      minWidth = 10;
    }
    let value = getValue();

    switch (definition.type) {
      case "string":
      case "date":
      case "integer":
      case "number":
        if (!definition.valueList) {
          return (
            <AutosizeInput
              className={classes.editor}
              value={value}
              type={type}
              inputStyle={{
                fontSize: 14,
                maxWidth: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              minWidth={minWidth}
              onChange={handleOnChange}
            />
          );
        } else {
          return (
            <span className={classes.editorDisplay} onClick={onClickEdit}>
              {value}
            </span>
          );
        }
      case "array":
        return renderArray();
      case "object":
        return renderObject();
      default:
        return renderDefault();
    }
  } catch (error) {
    return renderDefault();
  }
}
