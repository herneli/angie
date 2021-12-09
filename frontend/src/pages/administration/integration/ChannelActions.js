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

    add = () => {
        const channelId = uuid_v4();

        const newChannels = this.onChannelUpdate(
            {
                name: "Channel",
                id: channelId,
                created_on: moment().toISOString(),
                version: 0,
                nodes: [],
                options: {
                    trace_file: true,
                    trace_incoming_message: false,
                    trace_headers: false,
                    trace_properties: false,
                    trace_outgoing_message: false,
                },
                enabled: true,
                status: "UNDEPLOYED",
            },
            "add"
        );

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
        const newChannels = this.onChannelUpdate({ id: targetKey }, "remove");
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

    channelStatusChanged = (channel) => {
        const newChannels = this.channels.map((chn) => {
            if (chn.id === channel.id) {
                chn = channel;
            }
            return chn;
        });
        this.setChannels(newChannels);
    };

    deployChannel = async (integration, identifier, reloadChannels) => {
        if (this.pendingChanges) {
            return notification.error({
                message: "Cambios pendientes",
                description: "Guarde sus cambios para antes de desplegar el canal.",
            });
        }
        try {
            const response = await axios.post(`/integration/${integration}/channel/${identifier}/deploy`);
            if (response?.data?.success && reloadChannels !== false) {
                let newChann = response?.data?.data;
                return this.channelStatusChanged(newChann);
            }
        } catch (ex) {
            console.log(ex);
            return notification.error({
                message: "Se ha producido un error",
                description: "No se ha podido desplegar el canal, revise el log para mas información.",
            });
        }
    };

    undeployChannel = async (integration, identifier, reloadChannels) => {
        try {
            const response = await axios.post(`/integration/${integration}/channel/${identifier}/undeploy`);
            if (response?.data?.success && reloadChannels !== false) {
                let newChann = response?.data?.data;
                return this.channelStatusChanged(newChann);
            }
        } catch (ex) {
            console.log(ex);
            return notification.error({
                message: "Se ha producido un error",
                description: "No se ha podido replegar el canal, revise el log para mas información.",
            });
        }
    };
}

export default ChannelActions;
