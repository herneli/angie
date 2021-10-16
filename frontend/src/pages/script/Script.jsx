import React from "react";
import VisualScript from "../../components/visual-script/VisualScript";
import ScriptManager from "../../components/visual-script/ScriptManager";
import testScript from "./testScript.json";

export default function Script() {
    let manager = new ScriptManager();
    return <VisualScript manager={manager} script={testScript} />;
}
