import React from "react";
import T from "i18n-react";
import { Select } from "antd";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    select: {
        fontWeight: 500,
    },
});

export default function CombinatorSelect({ value, onChange }) {
    const classes = useStyles();
    const handleOnSelect = (value) => {
        onChange && onChange(value);
    };

    const options = [
        { label: T.translate("visual_script.rule_all"), value: "all" },
        { label: T.translate("visual_script.rule_any"), value: "any" },
    ];

    return (
        <Select
            value={value}
            options={options}
            onSelect={handleOnSelect}
            bordered={false}
            className={classes.select}
        />
    );
}
