import { default as DefaultAceEditor } from "react-ace";

import "ace-builds/src-noconflict/mode-groovy";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

import { default as beautifier } from "xml-beautifier";
import { useEffect } from "react";

const AceEditor = (props) => {
    console.log(props);
    const { mode, beautify, value } = props;
    let { commands } = props;

    useEffect(() => {
        if (beautify && mode) {
            beautifyCode(value);
        }
    }, []);

    const beautifyCode = (val) => {
        let newValue = val;
        try {
            switch (mode) {
                case "json":
                    newValue = JSON.stringify(JSON.parse(val), null, 4);
                    break;
                case "xml":
                case "html":
                    newValue = beautifier(val);
                    break;

                default:
            }
            setTimeout(() => props.onChange && props.onChange(newValue), 100); //Force rerender beautified
        } catch (ex) {
            // console.error(ex);
        }
    };
    if (!commands) {
        commands = [];
    }

    commands.push({
        // commands is array of key bindings.
        name: "beautify", //name for the key binding.
        bindKey: { win: "Alt-Shift-f", mac: "Shift-Alt-f" }, //key combination used for the command.
        exec: (editor) => {
            console.log("wii");
            beautifyCode(editor.getValue());
        }, //function to execute when keys are pressed.
    });
    return <DefaultAceEditor {...props} commands={commands} />;
};

export default AceEditor;
