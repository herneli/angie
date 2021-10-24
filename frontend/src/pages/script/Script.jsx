import React from "react";
import VisualScript from "../../components/visual-script/VisualScript";
import testScript from "./testScript.json";

export default function Script() {
    return <VisualScript script={testScript} />;
}
