import { notification, Spin } from "antd";
import axios from "axios";
import moment from "moment";
import { useState } from "react";
import lodash from "lodash";
import StatusMap from "../StatusMap";

import T from "i18n-react";

const defaultDates = [moment().subtract(1, "day"), moment().endOf("day")];

const MessagesStatusMap = ({ entity, height }) => {
    const [tableLoading, setTableLoading] = useState(false);
    const [mapLoading, setMaLoading] = useState(false);
    const [tags, setTags] = useState({});
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
        setMaLoading(true);
        try {
            getEntityFilter(filters);

            const response = await axios.post("/tag/list/tags", { filters, checkedNodes });

            if (response?.data?.data) {
                setTags({ ...response?.data?.data });
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
            console.error(ex);
        }
        setMaLoading(false);
    };

    const loadData = async (pagination, filters = {}, sorts, checkedNodes) => {
        setTableLoading(true);
        try {
            if (pagination?.pageSize && pagination?.current) {
                filters.limit = pagination.pageSize ? pagination.pageSize : 10;
                filters.start =
                    (pagination.current ? pagination.current - 1 : 0) *
                    (pagination.pageSize ? pagination.pageSize : 10);
            }
            getEntityFilter(filters);

            if (sorts) {
                filters.sort =
                    Object.keys(sorts).length !== 0
                        ? {
                              field: sorts.columnKey || sorts.field,
                              direction: sorts.order,
                          }
                        : { field: "date_reception", direction: "descend" };
            }

            const response = await axios.post("/tag/list/messages", { filters, checkedNodes });

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
                tags={tags}
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
