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
    return <VisualScript script={testScript} />;
}
