import React from "react";
import { createUseStyles } from "react-jss";
import Form from "@rjsf/antd";
import { Button, Card, Row, Space } from "antd";
import T from "i18n-react";
import { useEffect } from "react";
import AntdArrayFieldTemplate from "../../../common/rjsf/AntdArrayFieldTemplate";
import SchemaField from "@rjsf/core/lib/components/fields/SchemaField";
import AntdObjectFieldTemplate from "../../../common/rjsf/AntdObjectFieldTemplate";

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

export default function ModelEditor({
    data,
    schema,
    uiSchema,
    onCancel,
    onClose,
    onSave,
}) {
    const classes = useStyles();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleOnSave = (event) => {
        onSave(event.formData);
    };

    return (
        <div className={classes.tableWrapper}>
            <Button
                aria-label="close"
                className={classes.close}
                onClick={onClose}
            >
                Back
            </Button>
            <Card className={classes.paper}>
                <Form
                    ObjectFieldTemplate={AntdObjectFieldTemplate}
                    ArrayFieldTemplate={AntdArrayFieldTemplate}
                    schema={schema}
                    uiSchema={uiSchema}
                    formData={data}
                    onSubmit={handleOnSave}
                >
                    <Row justify="end">
                        <Space>
                            <Button onClick={onCancel}>
                                {T.translate("configuration.cancel")}
                            </Button>
                            <Button
                                className={classes.rightActions}
                                htmlType="submit"
                                type="primary"
                            >
                                {T.translate("configuration.save")}
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}
