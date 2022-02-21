import { notification, Spin } from "antd";
import axios from "axios";
import moment from "moment";
import { useState } from "react";
import lodash from "lodash";
import StatusMap from "../common/StatusMap";

import T from "i18n-react";

const defaultDates = [moment().subtract(1, "day"), moment().endOf("day")];

const MessagesStatusMap = ({ entity, height }) => {
    const [tableLoading, setTableLoading] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    const [checks, setChecks] = useState({});
    const [dataSource, setDataSource] = useState({});

    const getEntityFilter = (filters) => {
        if (entity) {
            const messageIds = lodash.map(entity.messages, "id");

            filters["message_id"] = {
                type: "in",
                value: messageIds, //TODO Limit!
            };
        }
    };

    const loadMap = async (filters = {}, checkedNodes) => {
        setMapLoading(true);
        try {
            getEntityFilter(filters);

            const response = await axios.post("/checkpoint/list/checkpoints", { filters, checkedNodes });

            if (response?.data?.data) {
                setChecks({ ...response?.data?.data });
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
            console.error(ex);
        }
        setMapLoading(false);
    };

    const loadData = async (pagination, filters = {}, sorts, checkedNodes) => {
        setTableLoading(true);
        try {
            filters.limit = pagination?.pageSize || 10;
            filters.start = (pagination?.current - 1 || 0) * (pagination?.pageSize || 10);

            getEntityFilter(filters);

            filters.sort =
                sorts && Object.keys(sorts).length !== 0
                    ? {
                          field: sorts.columnKey || sorts.field,
                          direction: sorts.order,
                      }
                    : { field: "date_reception", direction: "descend" };

            const response = await axios.post("/checkpoint/list/messages", { filters, checkedNodes });

            if (response?.data) {
                setDataSource({ ...response?.data });
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
            console.error(ex);
        }
        setTableLoading(false);
    };

    return (
        <div>
            <StatusMap
                defaultDates={defaultDates}
                checks={checks}
                dataSource={dataSource}
                doMapLoad={loadMap}
                doTableLoad={loadData}
                mapLoading={mapLoading}
                tableLoading={tableLoading}
                height={height}
            />
        </div>
    );
};

export default MessagesStatusMap;
