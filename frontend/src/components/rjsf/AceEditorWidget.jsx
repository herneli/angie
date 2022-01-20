import React from "react";

import AceEditor from "../ace-editor/AceEditor";

const AceEditorWidget = function ({ id, value, onChange, options, readonly }) {
    let mode = options.mode;
    if (mode === "json_text") {
        mode = "json";
    }

    let disableValidation = options?.disableValidation || false;

    //editorProps={{ $blockScrolling: true }}
    return (
        <AceEditor
            width="100%"
            {...options}
            height={options.height || "200px"}
            mode={mode}
            theme={"github"}
            onChange={(value) => {
                onChange(value);
            }}
            setOptions={{
                useWorker: !disableValidation,
            }}
            value={value}
            name={id}
            readOnly={readonly}
        />
    );
};

export default AceEditorWidget;
