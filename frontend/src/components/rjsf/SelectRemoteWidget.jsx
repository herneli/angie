import React, { Component } from "react";
import { asNumber, guessType } from "@rjsf/core/lib/utils";
import { Select } from "antd";
import T from "i18n-react";
import axios from "axios";
import get from "lodash/get";
import querystring from "query-string";

const nums = new Set(["number", "integer"]);

/**
 * This is a silly limitation in the DOM where option change event values are
 * always retrieved as strings.
 */

const processValue = (schema, value) => {
    // "enum" is a reserved word, so only "type" and "items" can be destructured
    const { type, items } = schema;
    if (value === "") {
        return undefined;
    } else if (type === "array" && items && nums.has(items.type)) {
        return value.map(asNumber);
    } else if (type === "boolean") {
        return value === "true";
    } else if (type === "number") {
        return asNumber(value);
    }

    // If type is undefined, but an enum is present, try and infer the type from
    // the enum values
    if (schema.enum) {
        if (schema.enum.every((x) => guessType(x) === "number")) {
            return asNumber(value);
        } else if (schema.enum.every((x) => guessType(x) === "boolean")) {
            return value === "true";
        }
    }

    return value;
};

function getselectOptions(url, returnPath) {
    return axios.get(url).then((response) => {
        if (!response || !response.data) {
            return [];
        }
        if (!returnPath) {
            return response.data;
        } else {
            return get(response.data, returnPath);
        }
    });
}
export default class SelectRemoteWidget extends Component {
    state = { options: [] };
    componentDidMount() {
        let { selectOptions } = this.props.options;
        let valueField = "code";
        let labelField = "name";
        let path = null;

        // Parse selectOptions field for config

        let [url, config] = selectOptions.split("#");
        if (config) {
            config = querystring.parse(config);
            path = config.path;
            if (config.value) {
                valueField = config.value;
            }
            if (config.label) {
                labelField = config.label;
            }
        }
        getselectOptions(url, path).then((entries) => {
            let options = entries.map((entry) => ({
                value: get(entry, valueField),
                label: get(entry, labelField),
            }));
            options = [
                { value: null, label: T.translate("Select...") },
                ...options,
            ];

            this.setState({ ...this.state, options: options });
        });
    }

    handleOnChange = (value) => {
        this.props.onChange(processValue(this.props.schema, value));
    };
    handleOnBlur = (selectedValue) => {
        this.props.onBlur(
            this.props.id,
            processValue(this.props.schema, selectedValue)
        );
    };
    handleOnFocus = (selectedValue) => {
        this.props.onFocus(
            this.props.id,
            processValue(this.props.schema, selectedValue)
        );
    };

    render() {
        let {
            schema,
            id,
            label,
            required,
            disabled,
            readonly,
            value = "",
            multiple,
            autofocus,
        } = this.props;

        const emptyValue = multiple ? [] : "";
        return (
            <Select
                multiple={typeof multiple === "undefined" ? false : multiple}
                options={this.state.options}
                value={
                    typeof value === "undefined" || value === null
                        ? emptyValue
                        : value
                }
                required={required}
                disabled={disabled || readonly}
                autoFocus={autofocus}
                onChange={this.handleOnChange}
                onBlur={this.handleOnBlur}
                onFocus={this.handleOnFocus}
                showSearch
            />
        );
    }
}
