import { Col, DatePicker, Input, Row } from "antd";
import moment from "moment";

const { RangePicker } = DatePicker;

const dateFormat = "YYYY/MM/DD HH:mm:ss";

const BasicFilter = ({ hideDateFilter, defaultDates, onSearch, onDateChange, customDateRanges, children }) => {
    return (
        <Row>
            <Col flex={2}>
                <Input.Search onSearch={(element) => onSearch(element)} enterButton />
            </Col>
            <Col flex={1}>
                <Row justify="end">
                    {hideDateFilter !== true && (
                        <RangePicker
                            ranges={
                                customDateRanges || {
                                    Today: [moment().startOf("day"), moment().endOf("day")],
                                    "This Month": [moment().startOf("month"), moment().endOf("month")],
                                }
                            }
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
