import React from "react";
import VisualScript from "../../components/visual-script/VisualScript";
import ScriptManager from "../../components/visual-script/ScriptManager";
import testScript from "./testScript.json";

export default function Script() {
    let context = {
        memberType: "context",
        code: "context",
        name: "context",
        type: { type: "object", objectCode: "context_test" },
    };
    let manager = new ScriptManager({ context, language: "js" });
    return <VisualScript manager={manager} script={testScript} />;
}
