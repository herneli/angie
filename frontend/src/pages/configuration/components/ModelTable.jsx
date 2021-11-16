import React, { useState, useEffect } from "react";
import { Button, Col, Row, Input, Table, message, Popconfirm } from "antd";
import { createUseStyles } from "react-jss";
import T from "i18n-react";
// import ModelOverwriteDialog from "./ModelOverwriteDialog";
import { mdiUpload, mdiPlus, mdiDelete, mdiContentCopy, mdiDownload, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
const { Search } = Input;

const useStyles = createUseStyles({
    card: {
        margin: 10,
    },
    search: {
        marginBottom: 15,
    },
    button: {
        fontSize: 10,
    },
    icon: {
        color: "#3d99f6",
        width: 20,
        height: 20,
    },
});

export default function ModelTable({
    modelInfo,
    modelData,
    onAddData,
    onDeleteData,
    onEditData,
    onSaveData,
    total,
    onSearchData,
    onSaveDataBatch,
}) {
    const calculateColumns = (info) => {
        if (info) {
            let columns = info.listFields.map((field) => ({
                title: field.title,
                dataIndex: field.field,
                sorter: true,
            }));
            columns.push({
                title: T.translate("configuration.actions"),
                key: "_actions",
                fixed: "right",
                width: 180,
                render: (text, record) => (
                    <Row justify="center">
                        <Button
                            icon={<Icon path={mdiPencil} className={classes.icon} />}
                            type="text"
                            title={T.translate("common.button.edit")}
                            onClick={(e) => handleOnRowClick(record)}
                        />

                        <Popconfirm
                            title={T.translate("configuration.do_you_want_to_duplicate_the_item")}
                            onConfirm={(e) => handleOnDuplicateModel(e, record)}>
                            <Button
                                icon={<Icon path={mdiContentCopy} className={classes.icon} />}
                                type="text"
                                title={T.translate("common.button.duplicate")}
                            />
                        </Popconfirm>
                        <Button
                            icon={<Icon path={mdiDownload} className={classes.icon} />}
                            type="text"
                            title={T.translate("common.button.download")}
                            onClick={(e) => handleOnDownloadModel(e, record)}
                        />
                        <Popconfirm
                            title={T.translate("configuration.do_you_want_to_delete_the_item")}
                            onConfirm={(e) => handleOnDeleteModel(e, record)}>
                            <Button
                                icon={<Icon path={mdiDelete} className={classes.icon} />}
                                type="text"
                                title={T.translate("common.button.delete")}
                            />
                        </Popconfirm>
                    </Row>
                ),
            });
            return columns;
        } else {
            return null;
        }
    };
    const [importItems, setImportItems] = useState();
    const [searchString, setSearchString] = useState();
    const [pagination, setPagination] = useState({});
    const [paramsPagination, setParamsPagination] = useState({ limit: 10, start: 0 });

    const classes = useStyles();

    const columns = calculateColumns(modelInfo);

    const handleOnRowClick = (rowData) => {
        onEditData(rowData);
    };

    const handleOnDeleteModel = (e, row) => {
        onDeleteData(row);
    };

    const handleOnDuplicateModel = (e, row) => {
        const newItem = {
            ...row,
            id: null,
            code: `${row.code}_CLONED`,
            name_: `${row.name} CLONED`,
        };
        onSaveData(newItem);
    };

    const downloadJsonFile = (data, filename) => {
        let filedata = JSON.stringify(data, null, 2);
        const blob = new Blob([filedata], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;
        link.click();
    };

    const uploadJsonFile = () => {
        return new Promise((resolve, reject) => {
            const uploadFile = (file) => {
                try {
                    var reader = new FileReader();
                    reader.onload = (readerEvent) => {
                        var content = readerEvent.target.result; // this is the content!
                        var data = JSON.parse(content);
                        resolve(data);
                    };
                    reader.readAsText(file, "UTF-8");
                } catch (error) {
                    reject(error);
                }
            };

            var input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json";
            input.onchange = (e) => uploadFile(e.target.files[0]);
            input.click();
        });
    };

    const handleOnDownloadModel = (e, row) => {
        // e.stopPropagation();

        const data = [row];
        downloadJsonFile(data, `${modelInfo.name}-${row.code}.json`);
    };

    const handleDownloadTable = (data) => {
        downloadJsonFile(data, `${modelInfo.name}.json`);
    };

    const handleUploadTable = () => {
        uploadJsonFile()
            .then((importItems) => {
                const promises = importItems.map((item) => onSaveDataBatch({ ...item, id: null }, false));
                Promise.all(promises).then((values) => {
                    message.info(T.translate("configuration.end_of_loading_json_file"));
                });
            })
            .catch((error) => message.error(T.translate("configuration.error_loading_json_file")));
    };

    // const handleOnCheckAction = (checked) => {
    //     const items = importItems;
    //     setImportItems(null);
    //     const promises = items.map((item) =>
    //         onSaveData({ ...item, id: null }, checked)
    //     );
    //     Promise.all(promises).then((values) => {
    //         message.info(T.translate("configuration.end_of_loading_json_file"));
    //     });
    // };

    const search = async (params, searchValue, sorter) => {
        let paginationObject = paramsPagination;
        let filters = {};
        let tableSort = { field: "data->'" + sorter?.column?.dataIndex + "'" || "data->'" + sorter?.field + "'", direction: sorter?.order };

        if (searchValue != "" && searchValue != undefined && Object.keys(searchValue).length > 0) {
            filters = {
                column: {
                    type: "jsonb",
                    value: searchValue,
                },
            };
        }

        if (tableSort.field && tableSort.direction) {
            filters.sort = tableSort;
        }

        if (params?.pageSize && params?.current) {
            paginationObject = { limit: params.pageSize, start: params.current * params.pageSize - params.pageSize + 1 };
            if (params.current == 1) {
                paginationObject.start = 0;
            }

            await onSearchData(modelInfo, filters, paginationObject);
        } else {
            await onSearchData(modelInfo, filters, paginationObject);
        }
    };

    //ComponentDidMount
    useEffect(() => {
        search();
    }, []);

    useEffect(() => {
        setPagination({ total: total, showSizeChanger: true });
    }, [total]);

    let filteredData = !searchString ? modelData : "";

    if (!columns) {
        return <h1>Loading...</h1>;
    }

    return (
        <div>
            {/* {importItems && (
        <ModelOverwriteDialog
          open={!!importItems}
          onCheckAction={handleOnCheckAction}
          onClose={() => setImportItems(null)}
        />
      )} */}
            {importItems ? <h1>Imported items</h1> : null}

            <Card className={classes.card}>
                <Row>
                    <Col flex={1}>
                        <Search className={classes.search} onSearch={(element) => search(null, element)} enterButton />
                    </Col>
                    <Col flex={2}>
                        <Row justify="end" gutter={10}>
                            <Col>
                                <Button icon={<Icon path={mdiUpload} className={classes.icon} />} type="text" onClick={handleUploadTable} />
                            </Col>
                            <Col>
                                <Button
                                    icon={<Icon path={mdiDownload} className={classes.icon} />}
                                    type="text"
                                    onClick={() => handleDownloadTable(filteredData)}
                                />
                            </Col>
                            <Col>
                                <Button icon={<Icon path={mdiPlus} className={classes.icon} />} type="text" onClick={onAddData} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    pagination={pagination}
                    rowKey={"id"}
                    sorta
                    onChange={search}
                    onRow={(record, index) => {
                        return {
                            onClick: () => handleOnRowClick(record),
                        };
                    }}
                    bordered
                    size="small"
                />
            </Card>
        </div>
    );
}
