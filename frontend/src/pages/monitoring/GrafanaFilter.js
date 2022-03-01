import T from "i18n-react";
import moment from "moment";
import { DatePicker, Select } from "antd";
import IconButton from "../../components/button/IconButton";
import Icon from "@ant-design/icons/lib/components/Icon";
import { mdiRefresh, mdiReload } from "@mdi/js";
import { Option } from "antd/lib/mentions";

export default function GrafanaFilter({ setIframeRefresh, setReload, setDateTimeRange, children }) {
    const { RangePicker } = DatePicker;

    const timeRanges = {};
    timeRanges[T.translate("common.date_ranges.last_minutes", { minutes: 30 })] = [
        moment().subtract(30, "minute").startOf("minute"),
        moment().endOf("minute"),
    ];
    timeRanges[T.translate("common.date_ranges.last_hour")] = [
        moment().subtract(1, "hour").startOf("hour"),
        moment().endOf("minute"),
    ];
    timeRanges[T.translate("common.date_ranges.last_hours", { hours: 6 })] = [
        moment().subtract(6, "hour").startOf("hour"),
        moment().endOf("minute"),
    ];
    timeRanges[T.translate("common.date_ranges.last_hours", { hours: 12 })] = [
        moment().subtract(12, "hour").startOf("hour"),
        moment().endOf("minute"),
    ];
    timeRanges[T.translate("common.date_ranges.last_hours", { hours: 24 })] = [
        moment().subtract(24, "hour").startOf("hour"),
        moment().endOf("minute"),
    ];
    timeRanges[T.translate("common.date_ranges.last_week")] = [
        moment().subtract(1, "week").startOf("week"),
        moment().endOf("minute"),
    ];
    timeRanges[T.translate("common.date_ranges.last_month")] = [
        moment().subtract(1, "month").startOf("month"),
        moment().endOf("minute"),
    ];

    const drawRefreshOptions = () => {
        const refreshValues = [false, "5s", "10s", "30s", "1m", "5m", "15m", "30m"];
        return refreshValues.map((value) => {
            return (
                <Option value={value}>
                    {value || "Off"}
                    <Icon path={mdiReload} size={0.6} color="green" title={"aa"} />
                </Option>
            );
        });
    };

    const handleRefreshChange = (newValue) => {
        if (newValue) {
            setIframeRefresh(`&refresh=${newValue}`);
        } else {
            setIframeRefresh("");
        }
    };

    return (
        <div style={{ display: "flex", gap: ".5rem", float: "right", justifyContent: "end" }}>
            <RangePicker
                ranges={timeRanges}
                showTime
                format={"YYYY/MM/DD HH:mm:ss"}
                allowEmpty={[false, true]}
                allowClear
                onChange={(dates) => {
                    if (dates) {
                        let newtimeRange = `&from=${dates[0].unix()}000`;
                        if (dates[1]) {
                            newtimeRange += `&to=${dates[1].unix()}000`;
                        }
                        setDateTimeRange(newtimeRange);
                    } else {
                        setDateTimeRange("");
                    }
                }}
            />
            <IconButton
                onClick={() => {
                    setReload(Math.random());
                }}
                icon={{
                    path: mdiRefresh,
                    size: 0.7,
                }}
            />
            <Select defaultValue={"5s"} placeholder={"Refresco"} style={{ width: 70 }} onChange={handleRefreshChange}>
                {drawRefreshOptions()}
            </Select>
        </div>
    );
}
