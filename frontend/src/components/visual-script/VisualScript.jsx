import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import ScriptContextProvider from "./ScriptContext";
import Statement from "./statements/Statement";

const useStyles = createUseStyles({
    canvas: {
        position: "relative",
        backgroundColor: "white",
        textAlign: "center",
    },
});

export default function VisualScript({ manager, script }) {
    const [scriptState, setScriptState] = useState(script);
    const classes = useStyles();

    const handleOnChangeStatement = (statement) => {
        setScriptState({ ...script, mainStatement: statement });
    };
    return (
        <ScriptContextProvider manager={manager}>
            <div id="script-canvas" className={classes.canvas}>
                <Statement
                    statement={scriptState.mainStatement}
                    onChange={handleOnChangeStatement}
                />
            </div>
        </ScriptContextProvider>
    );
}
