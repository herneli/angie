import React from "react";
import { Button, Modal, Space } from "antd";
import T from "i18n-react";
import Form from "@rjsf/antd";
import formConfig from "../../rjsf";
import { useScriptContext } from "../ScriptContext";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    formFooter: {
        display: "flex",
        justifyContent: "right",
        marginTop: "20px",
    },
});

export default function StatementEditor({ statement, onChange, onCancel }) {
    const classes = useStyles();
    const { manager } = useScriptContext();

    const formSchemas = manager.getFormSchemas(statement);
    const handleOnSubmit = (form) => {
        onChange(form.formData);
    };
    return (
        <Modal
            title={T.translate("visual_script.edit")}
            visible={true}
            onCancel={onCancel}
            footer={null}
        >
            <Form
                ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                widgets={formConfig.widgets}
                schema={formSchemas.schema}
                uiSchema={formSchemas.uiSchema}
                onSubmit={handleOnSubmit}
                formData={statement}
            >
                <div className={classes.formFooter}>
                    <Space>
                        <Button onClick={onCancel}>
                            {T.translate("visual_script.cancel")}
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {T.translate("visual_script.accept")}
                        </Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    );
}
