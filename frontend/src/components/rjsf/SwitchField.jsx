import { Switch } from "antd";

const SwitchField = function (props) {
    return (
        <Switch
            style={{ marginTop: 5 }}
            id="custom"
            className={props.value ? "checked" : "unchecked"}
            checked={props.value}
            onChange={(checked) => props.onChange(checked)}
        />
    );
};

export default SwitchField;
