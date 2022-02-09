import { notification, Spin } from "antd";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useAngieSession } from "../../../components/security/UserContext";

import StatusMap from "../StatusMap";

import T from "i18n-react";

const defaultDates = [moment().subtract(1, "day"), moment().endOf("day")];

const MessagesStatusMap = () => {
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState({});
    const { currentUser } = useAngieSession();

    useEffect(() => {
        loadData();
    }, [currentUser]);

    const loadData = async (pagination, filters = {}, sorts, checkedNodes) => {
        setLoading(true);
        try {
            if (pagination?.pageSize && pagination?.current) {
                filters.limit = pagination.pageSize ? pagination.pageSize : 10;
                filters.start =
                    (pagination.current ? pagination.current - 1 : 0) *
                    (pagination.pageSize ? pagination.pageSize : 10);
            }

            if (sorts) {
                filters.sort = Object.keys(sorts).length !== 0 && {
                    field: sorts.columnKey || sorts.field,
                    direction: sorts.order,
                };
            }

            const response = await axios.post("/tag/list", { filters, checkedNodes});

            if (response?.data?.data) {
                setState({
                    ...response?.data?.data,
                    total: response?.data?.total,
                });
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
            console.error(ex);
        }
        setLoading(false);
    };

    return (
        <div>
            <Spin spinning={loading}>
                <StatusMap defaultDates={defaultDates} dataSource={state} doSearch={loadData} />
            </Spin>
        </div>
    );
};

export default MessagesStatusMap;
