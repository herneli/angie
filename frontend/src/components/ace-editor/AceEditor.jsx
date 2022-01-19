import { default as DefaultAceEditor } from "react-ace";

import "ace-builds/webpack-resolver";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/theme-github";

import Beautify from "ace-builds/src-noconflict/ext-beautify";

import { default as beautifier } from "xml-beautifier";
import { useEffect, useRef } from "react";

const AceEditor = (props) => {
    const editorRef = useRef(null);
    let { commands, mode, beautify } = props;

    const beautifyCode = (editor) => {
        var val = editor.session.getValue();
        let newValue = val;
        try {
            switch (mode) {
                case "json":
                    newValue = JSON.stringify(JSON.parse(val), null, 4);
                    editor.session.setValue(newValue);
                    break;
                case "xml":
                case "html":
                    newValue = beautifier(val);
                    editor.session.setValue(newValue);
                    break;

                case "groovy":
                    //TODO el por defecto hace alguna cosilla rara
                    break;
                default:
                    //por defecto se utiliza el validador de Ace
                    Beautify.beautify(editor.session);
            }
        } catch (ex) {
            // console.error(ex);
        }
    };

    useEffect(() => {
        if (editorRef) {
            if (mode) {
                require(`ace-builds/src-noconflict/mode-${props.mode}`);
            }

            if (beautify) {
                beautifyCode(editorRef.current.editor);
            }
        }
    }, []);

    if (!commands) {
        commands = [];
    }

    commands.push({
        // commands is array of key bindings.
        name: "beautify", //name for the key binding.
        bindKey: { win: "Alt-Shift-f", mac: "Shift-Alt-f" }, //key combination used for the command.
        exec: (editor) => {
            beautifyCode(editor);
        }, //function to execute when keys are pressed.
    });
    return <DefaultAceEditor ref={editorRef} {...props} commands={commands} />;
};

export default AceEditor;
