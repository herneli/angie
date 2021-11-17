import React, { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import VisualScript from "../visual-script/VisualScript";
import T from "i18n-react";
import axios from "axios";

export default function ScriptField({ name, formData, schema, uiSchema, onChange }) {
    const [editScript, setEditScript] = useState(false);

    useEffect(() => {
        if (!formData) {
            axios.get("/script/new/" + uiSchema["ui:options"].contextCode).then((response) => {
                onChange(response.data.data);
            });
        }
    });

    return <div>{formData ? <VisualScript script={formData} onChange={onChange} /> : null}</div>;
}
