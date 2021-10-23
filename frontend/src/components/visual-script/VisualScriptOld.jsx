import React, { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import ScriptContextProvider from "./ScriptContext";
import ScriptManager from "./ScriptManager";
import Statement from "./statements/Statement";

const useStyles = createUseStyles({
    canvas: {
        position: "relative",
        backgroundColor: "white",
        textAlign: "center",
    },
});

export default function VisualScript({ script }) {
    const [scriptState, setScriptState] = useState(script);
    const [manager, _setManager] = useState();
    const managerRef = useRef();

    const setManager = (manager) => {
        managerRef.current = manager;
        _setManager(manager);
    };
    const classes = useStyles();

    useEffect(() => {
        window.addEventListener("resize", handleResize);

        let newManager = new ScriptManager(script, "script-canvas");
        setManager(newManager);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (manager) {
            repaint(true);
        }
    });

    const repaint = (refresh) => {
        managerRef.current &&
            managerRef.current.drawConnections(
                scriptState.mainStatement,
                refresh
            );
    };

    const handleResize = () => {
        setTimeout(() => repaint(true), 1);
    };

    const handleOnChangeStatement = (statement) => {
        setScriptState({ ...script, mainStatement: statement });
    };

    return (
        <div id="script-canvas" className={classes.canvas}>
            {manager ? (
                <ScriptContextProvider manager={manager}>
                    <Statement
                        statement={scriptState.mainStatement}
                        onChange={handleOnChangeStatement}
                    />
                </ScriptContextProvider>
            ) : null}
        </div>
    );
}
