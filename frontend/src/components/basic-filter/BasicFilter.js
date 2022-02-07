import { Col, DatePicker, Input, Row } from "antd";
import moment from "moment";

import T from "i18n-react";

const { RangePicker } = DatePicker;

const dateFormat = "YYYY/MM/DD HH:mm:ss";

const BasicFilter = ({ hideDateFilter, defaultDates, onSearch, onDateChange, customDateRanges, children }) => {
    const defaultDateRanges = {};
    defaultDateRanges[T.translate("common.date_ranges.today")] = [moment().startOf("day"), moment().endOf("day")];
    defaultDateRanges[T.translate("common.date_ranges.last_24")] = [
        moment().subtract(24, "hour").startOf("hour"),
        moment().endOf("hour"),
    ];
    defaultDateRanges[T.translate("common.date_ranges.last_48")] = [
        moment().subtract(48, "hour").startOf("hour"),
        moment().endOf("hour"),
    ];
    defaultDateRanges[T.translate("common.date_ranges.week")] = [
        moment().subtract(1, "week").startOf("day"),
        moment().endOf("day"),
    ];
    defaultDateRanges[T.translate("common.date_ranges.month")] = [
        moment().subtract(1, "month").startOf("day"),
        moment().endOf("day"),
    ];

    return (
        <Row>
            <Col flex={2}>
                <Input.Search onSearch={(element) => onSearch(element)} enterButton />
            </Col>
            <Col flex={1}>
                <Row justify="end">
                    {hideDateFilter !== true && (
                        <RangePicker
                            ranges={customDateRanges || defaultDateRanges}
                            defaultValue={defaultDates}
                            showTime
                            format={dateFormat}
                            onChange={onDateChange}
                        />
                    )}
                    {children}
                </Row>
            </Col>
        </Row>
    );
};

export default BasicFilter;
