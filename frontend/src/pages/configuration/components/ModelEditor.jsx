import React from "react";
import { createUseStyles } from "react-jss";
import Form from "@rjsf/antd";
import { Button, Card, Row, Space } from "antd";
import T from "i18n-react";
import { useEffect } from "react";
import AntdArrayFieldTemplate from "../../../components/rjsf/AntdArrayFieldTemplate";
import AntdObjectFieldTemplate from "../../../components/rjsf/AntdObjectFieldTemplate";
import SelectRemoteWidget from "../../../components/rjsf/SelectRemoteWidget";

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
            <Card className={classes.paper}>
                <Form
                    ObjectFieldTemplate={AntdObjectFieldTemplate}
                    ArrayFieldTemplate={AntdArrayFieldTemplate}
                    widgets={{ SelectRemoteWidget: SelectRemoteWidget }}
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
