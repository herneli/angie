import React, { Component } from "react";
import PropTypes from "prop-types";
import * as types from "@rjsf/core/lib/types";
import {
    getUiOptions,
    getWidget,
    guessType,
    retrieveSchema,
    getDefaultFormState,
    getMatchingOption,
    deepEquals,
} from "@rjsf/core/lib/utils";
import withStyles from "react-jss";
import { mdiFunction } from "@mdi/js";
import { Select } from "antd";
import Icon from "@mdi/react";
import getTypeIcon from "../getTypeIcon";

const styles = {
    widgetContainer: {
        display: "flex",
    },
    widget: {
        flexGrow: 1,
        overflow: "auto",
        paddingRight: "12px",
    },
    selector: {
        flexGrow: 0,
    },
    selectorIcon: {
        color: "gray",
    },
};

class OneOfExpressionField extends Component {
    constructor(props) {
        super(props);

        const { formData, options } = this.props;

        this.state = {
            selectedOption: this.getMatchingOption(formData, options),
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            !deepEquals(this.props.formData, prevProps.formData) &&
            this.props.idSchema.$id === prevProps.idSchema.$id
        ) {
            const matchingOption = this.getMatchingOption(this.props.formData, this.props.options);

            if (!prevState || matchingOption === this.state.selectedOption) {
                return;
            }

            this.setState({
                selectedOption: matchingOption,
            });
        }
    }

    getMatchingOption(formData, options) {
        const { rootSchema } = this.props.registry;

        let option = getMatchingOption(formData, options, rootSchema);
        if (option !== 0) {
            return option;
        }
        // If the form data matches none of the options, use the currently selected
        // option, assuming it's available; otherwise use the first option
        return this && this.state ? this.state.selectedOption : 0;
    }

    onOptionChange = (option) => {
        const selectedOption = parseInt(option, 10);
        const { formData, onChange, options, registry } = this.props;
        const { rootSchema } = registry;
        const newOption = retrieveSchema(options[selectedOption], rootSchema, formData);

        // If the new option is of type object and the current data is an object,
        // discard properties added using the old option.
        let newFormData = undefined;
        if (guessType(formData) === "object" && (newOption.type === "object" || newOption.properties)) {
            newFormData = Object.assign({}, formData);

            const optionsToDiscard = options.slice();
            optionsToDiscard.splice(selectedOption, 1);

            // Discard any data added using other options
            for (const option of optionsToDiscard) {
                if (option.properties) {
                    for (const key in option.properties) {
                        if (newFormData.hasOwnProperty(key)) {
                            delete newFormData[key];
                        }
                    }
                }
            }
        }
        // Call getDefaultFormState to make sure defaults are populated on change.
        this.handleOnChange(getDefaultFormState(options[selectedOption], newFormData, rootSchema));

        this.setState({
            selectedOption: parseInt(option, 10),
        });
    };

    handleOnChange = (value) => {
        this.props.onChange(value);
    };

    render() {
        const {
            baseType,
            disabled,
            errorSchema,
            formData,
            idPrefix,
            idSchema,
            onBlur,
            onChange,
            onFocus,
            options,
            registry,
            uiSchema,
            schema,
            classes,
        } = this.props;

        const _SchemaField = registry.fields.SchemaField;
        const { widgets } = registry;
        const { selectedOption } = this.state;
        const { widget = "select", ...uiOptions } = getUiOptions(uiSchema);
        const Widget = getWidget({ type: "number" }, widget, widgets);

        const option = options[selectedOption] || null;

        let optionSchema;

        if (option) {
            // If the subschema doesn't declare a type, infer the type from the
            // parent schema
            optionSchema = option.type ? option : Object.assign({}, option, { type: baseType });
        }

        // const enumOptions = options.map((option, index) => ({
        //     label: option.title || `Option ${index + 1}`,
        //     value: index,
        // }));

        const enumOptions = options.map((option, index) => {
            let iconPath;
            if (option.type === "object" && option.properties && "$exp" in option.properties) {
                iconPath = getTypeIcon("expression");
            } else {
                let type = option.type;
                if (option.type === "string" && option.format === "date") {
                    type = "date";
                }
                iconPath = getTypeIcon(type);
            }

            return {
                value: index,
                iconPath: iconPath,
            };
        });

        let optionsUiSchema = { ...(uiSchema || {}) };

        if (optionSchema.type === "object" && optionSchema.properties && "$exp" in optionSchema.properties) {
            optionsUiSchema = {
                ...optionsUiSchema,
                "ui:field": "ExpressionField",
                "ui:hideLabel": true,
            };
        }
        return (
            <div className={classes.widgetContainer}>
                <div className={classes.widget}>
                    {option !== null && (
                        <_SchemaField
                            schema={optionSchema}
                            uiSchema={optionsUiSchema}
                            errorSchema={errorSchema}
                            idSchema={idSchema}
                            idPrefix={idPrefix}
                            formData={formData}
                            onChange={this.handleOnChange}
                            onBlur={onBlur}
                            onFocus={onFocus}
                            registry={registry}
                            disabled={disabled}
                        />
                    )}
                </div>
                <div className={classes.selector}>
                    <Select onSelect={this.onOptionChange} value={selectedOption} bordered={false}>
                        {enumOptions.map((enumOption) => {
                            return (
                                <Select.Option value={enumOption.value}>
                                    <Icon className={classes.selectorIcon} path={enumOption.iconPath} size="18px" />
                                </Select.Option>
                            );
                        })}
                    </Select>
                </div>
            </div>
        );
    }
}

// <Widget
//     id={`${idSchema.$id}${
//         schema.oneOf ? "__oneof_select" : "__anyof_select"
//     }`}
//     schema={{ type: "number", default: 0 }}
//     onChange={this.onOptionChange}
//     onBlur={onBlur}
//     onFocus={onFocus}
//     value={selectedOption}
//     options={{ enumOptions }}
//     {...uiOptions}
// />
OneOfExpressionField.defaultProps = {
    disabled: false,
    errorSchema: {},
    idSchema: {},
    uiSchema: {},
};

if (process.env.NODE_ENV !== "production") {
    OneOfExpressionField.propTypes = {
        options: PropTypes.arrayOf(PropTypes.object).isRequired,
        baseType: PropTypes.string,
        uiSchema: PropTypes.object,
        idSchema: PropTypes.object,
        formData: PropTypes.any,
        errorSchema: PropTypes.object,
        registry: types.registry.isRequired,
    };
}

export default withStyles(styles)(OneOfExpressionField);
