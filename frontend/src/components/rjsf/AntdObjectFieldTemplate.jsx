import React from "react";
import { Button, Col, Row } from "antd";
import { createUseStyles } from "react-jss";
import { canExpand } from "@rjsf/core/lib/utils";
import { PlusCircleOutlined } from "@ant-design/icons";

const useStyles = createUseStyles({
    border: {
        border: "1px solid #d9d9d9",
        borderRadius: "2px",
        padding: "12px",
    },
});
const AntdObjectFieldTemplate = ({
    DescriptionField,
    description,
    TitleField,
    title,
    properties,
    required,
    uiSchema,
    idSchema,
    formData,
    schema,
    disabled,
    readonly,
    onAddClick,
}) => {
    const classes = useStyles();
    const uiGridContainer = uiSchema["ui:grid"];

    let props = { gutter: 24 };
    if (uiGridContainer && uiGridContainer.row) {
        props = { ...uiGridContainer.row };
    }

    return (
        <Row {...props}>
            {(uiSchema["ui:title"] || title) && (
                <Col span={12}>
                    <TitleField id={`${idSchema.$id}-title`} title={title} required={required} />
                </Col>
            )}
            {description && (
                <Col span={24}>
                    <DescriptionField id={`${idSchema.$id}-description`} description={description} />
                </Col>
            )}
            <Col span={24}>
                <div className={uiSchema["ui:withBorder"] ? classes.border : null}>
                    <Row gutter={24}>
                        {properties.map((prop, index) => {
                            let columnSize = 12;
                            let uiGridItem = null;
                            if (prop.content && prop.content.props && prop.content.props.uiSchema) {
                                if (prop.content.props.uiSchema["ui:columnSize"]) {
                                    columnSize = prop.content.props.uiSchema["ui:columnSize"];
                                }
                                if (prop.content.props.uiSchema.uiGridItem) {
                                    uiGridItem = prop.content.props.uiSchema["ui:grid"];
                                }
                            }

                            let newProps = { span: 24 };
                            if (uiGridItem && uiGridItem.col) {
                                newProps = { ...uiGridItem.col };
                            } else if (columnSize) {
                                newProps = { span: columnSize * 2 };
                            }
                            return (
                                <Col key={index} {...newProps}>
                                    {prop.content}
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            </Col>
            {canExpand(schema, uiSchema, formData) && (
                <Col span={24}>
                    <Row gutter={24} justify="end">
                        <Col flex="192px">
                            <Button
                                block
                                className="object-property-expand"
                                disabled={disabled || readonly}
                                onClick={onAddClick(schema)}
                                type="primary">
                                <PlusCircleOutlined /> Add Item
                            </Button>
                        </Col>
                    </Row>
                </Col>
            )}
        </Row>
    );
};

export default AntdObjectFieldTemplate;
