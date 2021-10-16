import React from "react";
import { useScriptContext } from "../ScriptContext";

export default function Statement({ statement, onChange }) {
  const { manager } = useScriptContext();
  const Component = manager.getComponent(statement.type);
  return <Component statement={statement} onChange={onChange} />;
}
