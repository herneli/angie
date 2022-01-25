import React from "react";

import axios from "axios";
import { Button, Col, Popconfirm, Row, Table } from "antd";
import {
    DeleteOutlined,
    MenuOutlined,
    PlusCircleOutlined,
} from "@ant-design/icons";
import T from "i18n-react";

import ReactDragListView from "react-drag-listview";

const AntdArrayFieldTemplate = ({
    TitleField,
    DescriptionField,
    canAdd,
    disabled,
    formData,
    idSchema,
    items,
    onAddClick,
    readonly,
    required,
    schema,
    title,
    uiSchema,
}) => {
    let dataSource;
    let columns;
    let expanded;
    let {
        columns: optionsColumns,
        addable: optionsCanAdd = true,
        removable: optionsCanDelete = true,
        orderable: optionsCanSort = true,
    } = uiSchema["ui:options"] || {};

    if (schema.items.type === "object") {
        expanded = true;
        dataSource = formData.map((element, i) => ({
            ...element,
            key: i,
            index: items[i].index,
            hasMoveDown: items[i].hasMoveDown,
            hasMoveUp: items[i].hasMoveUp,
            onReorderClick: items[i].onReorderClick,
            onDropIndexClick: items[i].onDropIndexClick,
        }));

        if (!optionsColumns) {
            columns = Object.entries(schema.items.properties).map(
                ([key, value], i) => ({
                    title: value.title || key,
                    dataIndex: key,
                    key,
                    // fixed: i === 0 && "left",
                })
            );
        } else {
            columns = optionsColumns;
        }
    } else {
        expanded = false;
        dataSource = formData.map((element, i) => ({
            value: element,
            key: i,
            index: items[i].index,
            hasMoveDown: items[i].hasMoveDown,
            hasMoveUp: items[i].hasMoveUp,
            onReorderClick: items[i].onReorderClick,
            onDropIndexClick: items[i].onDropIndexClick,
        }));
        columns = [
            {
                title: title,
                key: "key",
                dataIndex: "value",
                render: (text, record) => items[record.key].children,
            },
        ];
    }

    if (optionsCanDelete) {
        columns = [
            ...columns,
            {
                title: T.translate("actions"),
                dataIndex: "action",
                fixed: "right",
                width: 50,
                render: (text, record) => (
                    <Popconfirm
                        title="Are you sure delete this item?"
                        onConfirm={record.onDropIndexClick(record.index)}
                        onCancel={() => {}}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<DeleteOutlined />}
                        ></Button>
                    </Popconfirm>
                ),
            },
        ];
    }
    if (optionsCanSort) {
        columns = [
            ...columns,
            {
                title: T.translate("sort"),
                dataIndex: "sort",
                fixed: "right",
                width: 50,
                className: "drag-handle",
                render: (text, record, index) => (
                    <MenuOutlined style={{ cursor: "pointer", color: "#999" }} />
                ),
            },
        ];
    }

    const dragProps = {
        onDragEnd(fromIndex, toIndex) {
            if (fromIndex !== toIndex) {
                dataSource[fromIndex].onReorderClick(fromIndex, toIndex)();
            }
        },
        handleSelector: "svg",
        nodeSelector: "tr.ant-table-row",
        ignoreSelector: "tr.ant-table-expanded-row",
    };

    return (
        <Row gutter={24}>
            {title && (
                <Col span={24}>
                    <TitleField
                        id={`${idSchema.$id}__title`}
                        key={`array-field-title-${idSchema.$id}`}
                        required={required}
                        title={uiSchema["ui:title"] || title}
                    />
                </Col>
            )}

            {(uiSchema["ui:description"] || schema.description) && (
                <Col span={24}>
                    <DescriptionField
                        description={
                            uiSchema["ui:description"] || schema.description
                        }
                        id={`${idSchema.$id}__description`}
                        key={`array-field-description-${idSchema.$id}`}
                    />
                </Col>
            )}

            <Col span={24}>
                <ReactDragListView {...dragProps}>
                    <Table
                        bordered
                        size="small"
                        columns={columns}
                        dataSource={dataSource}
                        // scroll={{ x: 1500, y: 500 }}
                        expandedRowRender={
                            expanded
                                ? (record, index, indent, expanded) => {
                                      return (
                                          <Row>
                                              <Col span={22} offset={1}>
                                                  {items[index].children}
                                              </Col>
                                          </Row>
                                      );
                                  }
                                : null
                        }
                        pagination={false}
                    />

                    {canAdd && optionsCanAdd && (
                        <Row gutter={24} justify="start">
                            <Col flex="192px">
                                <Button
                                    block
                                    className="array-item-add"
                                    disabled={disabled || readonly}
                                    onClick={onAddClick}
                                    type="primary"
                                    style={{ marginTop: 10 }}
                                >
                                    <PlusCircleOutlined />
                                </Button>
                            </Col>
                        </Row>
                    )}
                </ReactDragListView>
            </Col>
        </Row>
    );
};

export default AntdArrayFieldTemplate;
