import { mdiDatabaseArrowRightOutline } from "@mdi/js";
import { Popover, Space, Tag, Select } from "antd";
import IconButton from "../../components/button/IconButton";
import ChannelActions from "../administration/integration/ChannelActions";

import T from "i18n-react";
import { useState } from "react";

const AgentInfo = ({ integration, channel, currentAgent, agents, onActionEnd }) => {
    const [selectedAgent, setSelectedAgent] = useState(null);

    const channelActions = new ChannelActions();
    const content = (
        <Space>
            <Select style={{ width: 150 }} onChange={setSelectedAgent}>
                <Select.Option key={"any"}>
                    {T.translate("deployed_integrations.agent_actions.any_available")}
                </Select.Option>
                {agents.map((agent) => (
                    <Select.Option key={agent.id} disabled={currentAgent.id === agent.id || agent.status !== "online"}>
                        {agent.name}
                    </Select.Option>
                ))}
            </Select>

            <IconButton
                key="log"
                title={T.translate("deployed_integrations.agent_actions.move")}
                onClick={async () => {
                    if (selectedAgent === "any") {
                        await channelActions.deployToAnotherAgent(integration.id, channel.id);
                    } else {
                        await channelActions.deployToSpecificAgent(integration.id, channel.id, selectedAgent);
                    }
                    onActionEnd();
                }}
                icon={{
                    path: mdiDatabaseArrowRightOutline,
                    size: 0.6,
                    title: T.translate("deployed_integrations.agent_actions.move"),
                }}
            />
        </Space>
    );

    return (
        <Popover content={content} title={T.translate("deployed_integrations.agent_actions.title")} trigger="click">
            <Tag color={"gold"} style={{ cursor: "pointer" }}>
                {currentAgent?.name}
            </Tag>
        </Popover>
    );
};

export default AgentInfo;
