import React, { useEffect, useState } from "react";
import VisualScript from "../../components/visual-script/VisualScript";
import axios from "axios";
import { message } from "antd";
import T from "i18n-react";

export default function Script({ match }) {
    const [script, setScript] = useState();
    let code = match.params.code;

    useEffect(() => {
        axios.get("/script/code/" + code).then((response) => {
            setScript(response.data.data.data);
        });
    }, [code]);

    // const handleOnSave = (script) => {
    //     axios.post("/script/code/" + code, script).then((response) => {
    //         setScript(response.data.data.data);
    //         message.info(T.translate("visual_script.script_saved"));
    //     });
    // };
    const handleOnChange = (script) => {
        setScript(script);
    };

    const handleOnExecuteCode = (script) => {
        axios
            .post("/script/code/" + code, script)
            .then((response) => {
                setScript(response.data.data.data);
                message.info(T.translate("visual_script.script_saved"));
                return axios.get("/script/code/" + code + "/execute");
            })
            .then((response) => {
                let sourceCode = response.data.data;
                console.log("Code...");
                console.log(sourceCode);
                return axios.get("http://localhost:8080/groovy_json/" + code);
            })
            .then((response) => {
                console.log("Execution...");
                console.log(response.data);
            });
    };

    if (script) {
        return <VisualScript script={script} onChange={handleOnChange} onExecuteCode={handleOnExecuteCode} />;
    } else {
        return <h1>Loading...</h1>;
    }
}
