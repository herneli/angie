import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import Form from "@rjsf/antd";
import { Button, Row, Space } from "antd";
import T from "i18n-react";
import { useEffect } from "react";
import axios from "axios";
import formConfig from "../../../components/rjsf";
import ConditionalForm from "../../../components/rjsf/custom/ConditionalForm";

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

export default function ModelEditor({ data, schema, uiSchema, onCancel, onSave, onChange }) {
    const classes = useStyles();
    const [currentData, setCurrentData] = useState(data);

    useEffect(() => {
        setCurrentData(data);
    }, [data]);

    useEffect(() => {
        console.log('wii')
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        async function asyncloadEnum() {
            await loadEnum(uiSchema, schema);
        }
        schema = asyncloadEnum();
    }, [schema]);

    const handleOnSave = (event) => {
        onSave(event.formData);
    };

    //Encargado de cargar los enum si esta especificado el ""ui:url" actualmente solo funciona en la creación
    const loadEnum = async (uiSchema, schema) => {
        if (uiSchema) {
            Object.values(uiSchema).forEach(async (uiSchemaItem) => {
                if (uiSchemaItem && uiSchemaItem["ui:url"]) {
                    let response = await axios.get(uiSchemaItem["ui:url"]);
                    if ((response.success = "true")) {
                        let enumOpts = response.data.data.map((item) => item.name);
                        schema.properties["roles"].items.enum = enumOpts;
                    }
                }
            });
            return schema;
        } else {
            return schema;
        }
    };

    return (
        <div className={classes.tableWrapper}>
            <Button onClick={onCancel}>{T.translate("configuration.return")}</Button>
            <ConditionalForm
                ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                widgets={formConfig.widgets}
                schema={schema}
                uiSchema={uiSchema}
                formData={currentData}
                onSubmit={handleOnSave}
                onChange={(e) => {
                    setCurrentData({ ...currentData, ...e.formData });
                    if(onChange) onChange(e);
                }}>
                <Row justify="end">
                    <Space>
                        <Button onClick={onCancel}>{T.translate("configuration.return")}</Button>
                        <Button className={classes.rightActions} htmlType="submit" type="primary">
                            {T.translate("configuration.save")}
                        </Button>
                    </Space>
                </Row>
            </ConditionalForm>
        </div>
    );
}
