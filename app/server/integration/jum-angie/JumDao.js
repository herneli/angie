import axios from "axios";
import { App } from "lisco";

export default class JumDao {
    constructor() {
        this.jum_url = App.settings.getConfigValue("core:jum:url");
    }

    async deployRoute(id, content) {
        const response = await axios.post(this.jum_url + "/create", {
            routeId: id,
            routeConfiguration: content,
            name: id,
        });

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async undeployRoute(id) {
        const response = await axios.post(this.jum_url + "/undeploy/" + id);

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async startRoute(id) {
        const response = await axios.post(this.jum_url + "/start/" + id);

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async stopRoute(id) {
        const response = await axios.post(this.jum_url + "/stop/" + id);

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async getRouteStatus(id) {
        const response = await axios.get(this.jum_url + "/get/" + id);

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    getRouteStats(id) {}
}