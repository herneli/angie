import React from "react";
import { createUseStyles } from "react-jss";
import Form from "@rjsf/antd";
import { Button, Row, Space } from "antd";
import T from "i18n-react";
import { useEffect } from "react";
import formConfig from "../../../components/rjsf";

const useStyles = createUseStyles({
    tableWrapper: {
        padding: 15,
    },
    paper: {
        padding: 20,
    },
    leftActions: {
        float: "left",
    },
    rightActions: {
        float: "right",
    },
});

export default function ModelEditor({ data, schema, uiSchema, onCancel, onSave }) {
    const classes = useStyles();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleOnSave = (event) => {
        onSave(event.formData);
    };
    return (
        <div className={classes.tableWrapper}>
            <Button onClick={onCancel}>{T.translate("configuration.return")}</Button>
            <Form
                ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                widgets={formConfig.widgets}
                schema={schema}
                uiSchema={uiSchema}
                formData={data}
                onSubmit={handleOnSave}>
                <Row justify="end">
                    <Space>
                        <Button onClick={onCancel}>{T.translate("configuration.return")}</Button>
                        <Button className={classes.rightActions} htmlType="submit" type="primary">
                            {T.translate("configuration.save")}
                        </Button>
                    </Space>
                </Row>
            </Form>
        </div>
    );
}
