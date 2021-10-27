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

    const handleOnSave = (script) => {
        axios.post("/script/code/" + code, script).then((response) => {
            setScript(response.data.data.data);
            message.info(T.translate("visual_script.script_saved"));
        });
    };

    if (script) {
        return <VisualScript script={script} onSave={handleOnSave} />;
    } else {
        return <h1>Loading...</h1>;
    }
}
