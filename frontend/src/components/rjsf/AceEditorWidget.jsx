import React from "react";


import AceEditor from "../ace-editor/AceEditor";

const AceEditorWidget = function ({ id, value, onChange, options, readonly }) {
     

    let mode = options.mode;
    if (mode === "json_text") {
        mode = "json";
    }

    //editorProps={{ $blockScrolling: true }}
    return (
        <AceEditor
            width="100%"
            height={options.height || "200px"}
            mode={mode}
            beautify={options.beautify}
            theme={"github"}
            onChange={(value) => {
                onChange(value);
            }}
            value={value}
            name={id}
            setOptions={{
                useWorker: false,
            }}
            readOnly={readonly}
            
        />
    );
};

export default AceEditorWidget;
