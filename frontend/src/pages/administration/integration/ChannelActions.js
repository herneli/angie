import React from "react";
import moment from "moment";
import axios from "axios";

import { v4 as uuid_v4 } from "uuid";
import lodash from "lodash";
import T from "i18n-react";
import { notification } from "antd";

class ChannelActions {
    constructor(channels, pendingChanges, setChannels, setActiveTab, onChannelUpdate) {
        this.channels = channels;
        this.pendingChanges = pendingChanges;
        this.setChannels = setChannels;
        this.setActiveTab = setActiveTab;
        this.onChannelUpdate = onChannelUpdate;
    }

    add = (integration_id) => {
        const channelId = uuid_v4();
        const newChannels = [...this.channels];
        newChannels.push({
            name: "New Tab",
            id: channelId,
            integration_id: integration_id,
            created_on: moment().toISOString(),
            version: 0,
            nodes: [],
            enabled: true,
            status: "UNDEPLOYED",
        });
        if (newChannels.length === 1) {
            this.setActiveTab(channelId);
        }
        this.setChannels(newChannels);
    };

    remove = (targetKey, active) => {
        let prevIndex = this.channels.length !== 0 ? this.channels.length - 2 : 0;
        if (this.channels && this.channels[prevIndex]) {
            let newActiveKey = this.channels[prevIndex].id;

            if (active === targetKey) {
                this.setActiveTab(newActiveKey);
            }
        }
        const newChannels = this.channels.filter((channel) => channel.id !== targetKey);
        this.setChannels(newChannels);
    };

    edit = () => {};

    toggleEnabled = async (identifier) => {
        let channel = lodash.find(this.channels, { id: identifier });
        channel.enabled = !channel.enabled;
        if (!channel.enabled && channel.status === "STARTED") {
            await this.undeployChannel(identifier);
        }

        setTimeout(() => {
            let newChannels = this.onChannelUpdate(channel);
            this.setChannels(newChannels);
        }, 200);
    };

    deployChannel = async (identifier) => {
        try {
            const response = await axios.post(`/integration_channel/${identifier}/deploy`);
            if (response?.data?.success) {
                let newChann = response?.data?.data[0];
                const newChannels = this.onChannelUpdate(newChann);
                return this.setChannels(newChannels);
            }
        } catch (ex) {
            return notification.error({
                message: "Se ha producido un error",
                description: "No se ha podido desplegar el canal, revise el log para mas información.",
            });
        }
    };

    undeployChannel = async (identifier) => {
        try {
            const response = await axios.post(`/integration_channel/${identifier}/undeploy`);
            if (response?.data?.success) {
                let newChann = response?.data?.data[0];
                const newChannels = this.onChannelUpdate(newChann);
                return this.setChannels(newChannels);
            }
        } catch (ex) {
            return notification.error({
                message: "Se ha producido un error",
                description: "No se ha podido replegar el canal, revise el log para mas información.",
            });
        }
    };
}

export default ChannelActions;
