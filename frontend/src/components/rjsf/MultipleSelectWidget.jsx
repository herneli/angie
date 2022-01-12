import React, {  useEffect, useState } from "react";
import { asNumber, guessType } from "@rjsf/core/lib/utils";
import { Select } from "antd";
import axios from "axios";

const MultipleSelectWidget = (props) => {
    const [value, setValue] = useState({});
    const [treeData, setTreeData] = useState([]);

    const nums = new Set(["number", "integer"]);

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

    const handleOnChange = (value) => {
        props.onChange(processValue(props.schema, value));
    };

    useEffect(async () => {
        if (props.options.url) {
            
            let response = await axios.get(props.options.url);
            if ((response.success = "true")) {
                
                setTreeData(response.data.data);
            }
        }
        
        if(props && props.schema && props.schema.items && props.schema.items.enum && !(props.schema.items.enum instanceof Array)){
            
            let optionsOnServerSide = await axios.get(props.options.enumOptions)
            if(optionsOnServerSide.success = "true"){
                props.schema.items.enum = optionsOnServerSide.data
               
            }
        }
    }, []);

    return (
        <>
            <Select
                style={{ width: "100%" }}
                mode="multiple"
                value={props.value}
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                options={treeData}
                onChange={handleOnChange}
                placeholder="Please select"
                treeDefaultExpandAll
            />
        </>
    );
};

export default MultipleSelectWidget;
