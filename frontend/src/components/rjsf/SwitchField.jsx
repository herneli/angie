import { Switch } from "antd";

const SwitchField = function (props) {
    console.log(props);
    return (
        <div style={{ paddingTop: 5 }}>
            <label>{props.label}</label>
            <br />
            <Switch
                style={{ marginTop: 5 }}
                id="custom"
                className={props.value ? "checked" : "unchecked"}
                checked={props.value}
                onChange={(checked) => props.onChange(checked)}
            />
        </div>
    );
};

export default SwitchField;
