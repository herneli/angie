import React from "react";
import { Button, Card, Col, Row, Input, Table, message } from "antd";
import { createUseStyles } from "react-jss";
import T from "i18n-react";
// import ModelOverwriteDialog from "./ModelOverwriteDialog";
import { mdiUpload, mdiPlus, mdiDelete, mdiContentCopy, mdiDownload } from "@mdi/js";
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
    searchTerm,
    onAddData,
    onDeleteData,
    onEditData,
    onSaveData,
    onSaveDataBatch,
    onSearchTermChange,
}) {
    const calculateColumns = (info) => {
        if (info) {
            let columns = info.listFields.map((field) => ({
                title: field.title,
                dataIndex: field.field,
            }));
            columns.push({
                title: T.translate("configuration.actions"),
                key: "_actions",
                fixed: "right",
                render: (text, record) => (
                    <Row justify="center">
                        <Button
                            className={classes.button}
                            icon={<Icon path={mdiContentCopy} className={classes.icon} />}
                            type="text"
                            onClick={(e) => handleOnDuplicateModel(e, record)}
                        />
                        <Button
                            icon={<Icon path={mdiDownload} className={classes.icon} />}
                            type="text"
                            onClick={(e) => handleOnDownloadModel(e, record)}
                        />
                        <Button
                            icon={<Icon path={mdiDelete} className={classes.icon} />}
                            type="text"
                            onClick={(e) => handleOnDeleteModel(e, record)}
                        />
                    </Row>
                ),
            });
            return columns;
        } else {
            return null;
        }
    };
    // const [searchString, setSearchString] = useState();
    const classes = useStyles();

    const columns = calculateColumns(modelInfo);

    const handleOnRowClick = (rowData) => {
        onEditData(rowData);
    };

    const handleOnSearch = (e) => {
        onSearchTermChange(e.target.value);
    };

    const handleOnDeleteModel = (e, row) => {
        e.stopPropagation();

        const msg = T.translate("configuration.do_you_want_to_delete_the_item");
        if (window.confirm(`${msg} [${row.code}]`)) {
            onDeleteData(row);
        }
    };

    const handleOnDuplicateModel = (e, row) => {
        e.stopPropagation();
        const msg = T.translate("configuration.do_you_want_to_duplicate_the_item");
        if (window.confirm(`${msg} [${row.code}]`)) {
            const newItem = {
                ...row,
                id: null,
                code: `${row.code}_CLONED`,
                name_: `${row.name} CLONED`,
            };
            onSaveData(newItem);
        }
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
        e.stopPropagation();

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

    const filterData = () => {
        return modelData.filter((item) => {
            let included = false;
            modelInfo.listFields.forEach((field) => {
                if (
                    item[field.field] &&
                    item[field.field].toString().toLowerCase().includes(searchTerm.toLowerCase())
                ) {
                    included = true;
                }
            });
            return included;
        });
    };

    let filteredData = !searchTerm ? modelData : filterData();
    filteredData = filteredData.sort((a, b) => {
        const value = a.code === b.code ? 0 : a.code < b.code ? -1 : 1;
        return value;
    });

    if (!columns) {
        return <h1>Loading...</h1>;
    }

    return (
        <div>
            <Card className={classes.card}>
                <Row>
                    <Col flex={1}>
                        <Search className={classes.search} value={searchTerm} onChange={handleOnSearch} enterButton />
                    </Col>
                    <Col flex={2}>
                        <Row justify="end" gutter={10}>
                            <Col>
                                <Button
                                    icon={<Icon path={mdiUpload} className={classes.icon} />}
                                    type="text"
                                    onClick={handleUploadTable}
                                />
                            </Col>
                            <Col>
                                <Button
                                    icon={<Icon path={mdiDownload} className={classes.icon} />}
                                    type="text"
                                    onClick={() => handleDownloadTable(filteredData)}
                                />
                            </Col>
                            <Col>
                                <Button
                                    icon={<Icon path={mdiPlus} className={classes.icon} />}
                                    type="text"
                                    onClick={onAddData}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey={(record) => record.id.toString()}
                    pagination={{ pageSize: 100 }}
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
