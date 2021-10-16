import React, { useEffect, useState } from "react";
import { mdiChevronDown } from "@mdi/js";
import Icon from "@mdi/react";
import { List, Select, Button, Popover } from "antd";
import axios from "axios";

const { Option } = Select;
export default function ExpressionPartSelector({
    expression,
    classes,
    onChange,
}) {
    const [members, setMembers] = useState();

    const handleOnVisibleChange = (visible) => {
        if (visible) {
            axios
                .post("/script/object/members", {
                    language: "js",
                    type: { type: "object", objectCode: "context_test" },
                })
                .then((response) => {
                    setMembers(response.data.data.map((data) => data.data));
                });
        } else {
            setMembers(null);
        }
    };
    const handleOnSelect = () => {
        console.log("Click");
        setMembers(null);
    };

    const memberComponents = () => {
        return (
            members &&
            members.map((member, index) => (
                <Option key={index} value={member.code}>
                    {member.name}
                </Option>
            ))
        );
    };
    const renderMenu = () => {
        console.log("Render menu");
        return (
            <Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select a person"
                optionFilterProp="children"
                onSelect={handleOnSelect}
                autoFocus
            >
                {memberComponents()}
            </Select>
        );
    };
    return (
        <div className={classes.part}>
            <Popover
                content={renderMenu()}
                trigger={"click"}
                visible={!!members}
                onVisibleChange={handleOnVisibleChange}
            >
                <Button
                    type="text"
                    icon={<Icon size="14px" path={mdiChevronDown} />}
                />
            </Popover>
        </div>
    );
}
