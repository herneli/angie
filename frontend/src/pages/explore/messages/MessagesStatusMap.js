import { notification } from "antd";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useAngieSession } from "../../../components/security/UserContext";

import StatusMap from "../StatusMap";

import T from "i18n-react";

const defaultDates = [moment().subtract(1, "day"), moment()];

const MessagesStatusMap = () => {
    const [state, setState] = useState({});
    const [currentDates, setCurrentDates] = useState(defaultDates);

    const { currentUser } = useAngieSession();

    useEffect(() => {
        loadData();
    }, [currentDates, currentUser]);

    const loadData = async (customFilters) => {
        try {
            const filter = {
                start: 0,
                limit: 1000,
                ...customFilters,
            };
            if (currentDates) {
                filter["date_reception"] = {
                    type: "date",
                    start: currentDates[0].toISOString(),
                    end: currentDates[1].toISOString(),
                };
            }
            const response = await axios.post("/messages/list/withTags", filter);

            if (response?.data?.data) {
                setState(response?.data?.data);
            }
        } catch (ex) {
            notification.error({
                message: T.translate("common.messages.error.title"),
                description: T.translate("common.messages.error.description", { error: ex }),
            });
            console.error(ex);
        }
    };

    const onDateChange = (dates, dateStrings) => {
        setCurrentDates(dates);
    };

    const onSearch = (value) => {
        loadData(
            value && {
                "": {
                    type: "query_string",
                    value: value,
                },
            }
        );
    };
    return (
        <div>
            <StatusMap record={state} onDateChange={onDateChange} onSearch={onSearch} />
        </div>
    );
};

export default MessagesStatusMap;