import T from "i18n-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Modal, Table } from "antd";

const TaskLog = ({ visible, onClose }) => {
    const [filteredData, setFilteredData] = useState([]);
    const [pagination, setPagination] = useState({});
    const [sorts, setSorts] = useState({ columnKey: "start_datetime", order: "descend" });
    const [total, setTotal] = useState(0);

    const search = async (params, searchValue, sorts) => {
        let filters = {};

        if (params?.pageSize && params?.current) {
            filters.limit = params.pageSize ? params.pageSize : 10;
            filters.start = (params.current ? params.current - 1 : 0) * (params.pageSize ? params.pageSize : 10);
        }

        if (sorts) {
            filters.sort = Object.keys(sorts).length !== 0 && {
                field: sorts.columnKey || sorts.field,
                direction: sorts.order,
            };
        }

        let response = await axios.get("/task_log", { params: { filters: filters } });
        if (response) {
            setFilteredData(response.data.data);
            setTotal(response.data.total);
            setSorts(sorts);
        } else {
            setFilteredData([]);
            setTotal(0);
        }
    };

    useEffect(() => {
        if (visible) {
            search({ pageSize: 10, current: 1 }, null, sorts);
        }
    }, [visible]);

    useEffect(() => {
        setPagination({ total: total, showSizeChanger: true, pageSize: 10 });
    }, [total]);

    const getColumns = () => {
        return [
            {
                title: T.translate("administration.task_log_columns.code"),
                key: "task_code",
                dataIndex: "task_code",
                sorter: true,
            },
            {
                title: T.translate("administration.task_log_columns.startdate"),
                key: "start_datetime",
                dataIndex: "start_datetime",
                defaultSortOrder: "descend",
                sorter: true,
            },
            {
                title: T.translate("administration.task_log_columns.enddate"),
                key: "end_datetime",
                dataIndex: "end_datetime",
                sorter: true,
            },
            {
                title: T.translate("administration.task_log_columns.error"),
                key: "error",
                dataIndex: "error",
                sorter: true,
            },
        ];
    };
    return (
        <Modal
            width={1000}
            title={T.translate("administration.task_actions.task_log_title")}
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" type="dashed" onClick={onClose}>
                    {T.translate("common.button.close")}
                </Button>,
            ]}>
            <Table
                columns={getColumns()}
                dataSource={filteredData}
                pagination={pagination}
                rowKey={"id"}
                sort
                onChange={search}
                bordered
                size="small"
            />
        </Modal>
    );
};

export default TaskLog;
