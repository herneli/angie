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

    const handleOnClickEdit = () => {
        setEditScript(true);
    };

    const handleOnCancel = () => {
        setEditScript(false);
    };

    const handleOnSave = (script) => {
        onChange(script);
        setEditScript(false);
    };
    return (
        <>
            <Button type="primary" onClick={handleOnClickEdit}>
                {schema.title || name}
            </Button>
            {formData && editScript ? (
                <Modal visible={true} width="100%" footer={false} onCancel={handleOnCancel}>
                    <VisualScript script={formData} onSave={handleOnSave} />
                </Modal>
            ) : null}
        </>
    );
}
