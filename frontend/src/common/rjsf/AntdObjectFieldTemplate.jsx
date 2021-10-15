import React from "react";

import { Col, Row } from "antd";

const AntdObjectFieldTemplate = ({
    DescriptionField,
    description,
    TitleField,
    title,
    properties,
    required,
    uiSchema,
    idSchema,
}) => {
    const uiGridContainer = uiSchema["ui:grid"];
    let props = { gutter: 24 };
    if (uiGridContainer && uiGridContainer.row) {
        props = { ...uiGridContainer.row };
    }
    return (
        <Row {...props}>
            {(uiSchema["ui:title"] || title) && (
                <Col span={12}>
                    <TitleField
                        id={`${idSchema.$id}-title`}
                        title={title}
                        required={required}
                    />
                </Col>
            )}
            {description && (
                <Col span={24}>
                    <DescriptionField
                        id={`${idSchema.$id}-description`}
                        description={description}
                    />
                </Col>
            )}
            <Col span={24}>
                <Row gutter={24}>
                    {properties.map((prop, index) => {
                        let columnSize = 12;
                        let uiGridItem = null;
                        if (
                            prop.content &&
                            prop.content.props &&
                            prop.content.props.uiSchema
                        ) {
                            if (prop.content.props.uiSchema.columnSize) {
                                columnSize =
                                    prop.content.props.uiSchema.columnSize;
                            }
                            if (prop.content.props.uiSchema.uiGridItem) {
                                uiGridItem =
                                    prop.content.props.uiSchema["ui:grid"];
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
            </Col>
        </Row>
    );
};

export default AntdObjectFieldTemplate;
