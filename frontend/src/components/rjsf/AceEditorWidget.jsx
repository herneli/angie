import React, { useEffect } from "react";

import AceEditor from "react-ace";

import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

import beautify from "xml-beautifier";

const AceEditorWidget = function ({ id, value, onChange, options, readonly }) {
    const beautifyCode = (val) => {
        let newValue = val;
        try {
            switch (options.mode) {
                case "json":
                    newValue = JSON.stringify(JSON.parse(val), null, 4);
                    break;
                case "xml":
                case "html":
                    newValue = beautify(val);
                    break;

                default:
            }
            setTimeout(() => onChange(newValue), 100); //Force rerender beautified
        } catch (ex) {
            console.error(ex);
        }
    };

    useEffect(() => {
        if (options.beautify && options.mode) {
            beautifyCode(value);
        }
    }, []);

    //editorProps={{ $blockScrolling: true }}
    return (
        <AceEditor
            width="100%"
            height={options.height || "200px"}
            mode={options.mode}
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
            commands={[
                {
                    // commands is array of key bindings.
                    name: "beautify", //name for the key binding.
                    bindKey: { win: "Alt-Shift-f", mac: "Shift-Alt-f" }, //key combination used for the command.
                    exec: (editor) => {
                        beautifyCode(editor.getValue());
                    }, //function to execute when keys are pressed.
                },
            ]}
        />
    );
};

export default AceEditorWidget;
