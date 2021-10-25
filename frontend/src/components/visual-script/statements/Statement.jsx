import React from "react";
import { useScriptContext } from "../ScriptContext";

export default function Statement({
    statement,
    variables,
    onChange,
    onDelete,
}) {
    const { manager } = useScriptContext();
    const Component = manager.getComponent(statement.type);
    return (
        <Component
            statement={statement}
            variables={variables}
            onChange={onChange}
            onDelete={onDelete}
        />
    );
}
