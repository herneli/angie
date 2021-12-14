import axios from "axios";
import { App } from "lisco";

export default class JumDao {
    constructor() {
        this.jum_url = App.settings.getConfigValue("core:jum:url");
    }

    async deployRoute(id, content, options) {
        const response = await axios.post(this.jum_url + "/create", {
            id: id,
            xmlContent: content,
            name: id,
            options: options,
        });

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async undeployRoute(id) {
        const response = await axios.delete(this.jum_url + "/undeploy/" + id);

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async startRoute(id) {
        const response = await axios.put(this.jum_url + "/start/" + id);

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async stopRoute(id) {
        const response = await axios.put(this.jum_url + "/stop/" + id);

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async getRouteStatus(id) {
        console.log("obteniendo estado canal");
        const response = await axios.get(this.jum_url + "/get/" + id);

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async list() {
        const response = await axios.get(this.jum_url + "/list");

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async getRouteStats(id) {
        const response = await axios.get(this.jum_url + "/get/" + id + "?includeStats=true");

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    async getRouteLogs(id) {
        const response = await axios.get(this.jum_url + "/log/" + id);

        if (response.status != 200) {
            throw response;
        }
        return response.data;
    }

    getRouteStats(id) {}
}
