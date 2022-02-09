import { notification, Spin } from "antd";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useAngieSession } from "../../../components/security/UserContext";

import StatusMap from "../StatusMap";

import T from "i18n-react";
import Utils from '../../../common/Utils';

const defaultDates = [moment().subtract(1, "day"), moment().endOf("day")];

const MessagesStatusMap = () => {
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState({});
    const [currentDates, setCurrentDates] = useState(defaultDates);

    const { currentUser } = useAngieSession();

    useEffect(() => {
        loadData();
    }, [currentDates, currentUser]);

    const loadData = async (customFilters) => {
        setLoading(true);
        try {
            const filter = {
                start: 0,
                limit: 1000,
                ...customFilters,
            };
            if (currentDates) {
                filter["ztags.date_reception"] = {
                    type: "date",
                    start: currentDates[0].toISOString(),
                    end: currentDates[1].toISOString(),
                };
            }
            const response = await axios.post("/tag/list", filter);

            if (response?.data?.data) {
                setState({tags: response?.data?.data});
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

    const onDateChange = (dates, dateStrings) => {
        setCurrentDates(dates);
    };

    // const onSearch = (value) => {
    //     loadData(
    //         value && {
    //             "": {
    //                 type: "query_string",
    //                 value: value,
    //             },
    //         }
    //     );
    // };
    
    const onSearch = (value) => {
        if (value.indexOf(":") !== -1) {
            return loadData(
                Utils.getFiltersByPairs((key) => `${key}`, value)
            );
        }
        loadData(value && {
            "ztags": {
                type: "full-text-psql",
                value: value,
            },
        });
    };
    return (
        <div>
            <Spin spinning={loading}>
                <StatusMap defaultDates={defaultDates} record={state} onDateChange={onDateChange} onSearch={onSearch} />
            </Spin>
        </div>
    );
};

export default MessagesStatusMap;
