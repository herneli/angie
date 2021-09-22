import T from "i18n-react";
import axios from 'axios';
import lodash from 'lodash';
import UserHandler from "./UserHandler";

const serverURLDevelopment = 'http://localhost:3105/';


export default class Config {
    static components = [];
    static foodGroups = [];
    static configParams = [];

    static async loadConfigParams(first) {

        let params = {
            method: 'GET',
            url: '/config',
        };
        if (first) {
            params.headers = {
                Authorization: undefined,
                'Content-Type': 'application/json',
            }
        }

        let result = await axios(params);
        this.configParams = result.data;
    }

    static getAppName() {
        if (!this.configParams || this.configParams.length <= 0) {
            this.loadConfigParams();
        }
        return this.configParams['core.application.name'];
    }

    static getCurrentLang() {
        let current = Config.getAppDefaultLang();

        let user = UserHandler.getUser();
        if (user && user.currentLang) {
            current = user.currentLang;
        }
        return current;
    }

    static getAppDefaultLang() {
        if (!this.configParams || this.configParams.length <= 0) {
            this.loadConfigParams();
        }
        return this.configParams['core.application.lang.current'];
    }


    static getAppFallbackLang() {
        if (!this.configParams || this.configParams.length <= 0) {
            this.loadConfigParams();
        }
        return this.configParams['core.application.lang.fallback'];
    }
    static getLanguages() {
        if (!this.configParams || this.configParams.length <= 0) {
            this.loadConfigParams();
        }
        return lodash.split(this.configParams['core.application.lang.available'], ',');
    }

    static getServerURLDevelopment() {
        return serverURLDevelopment;
    }


    static millisToTime(ms) {

        let x = ms / 1000;
        let seconds = Math.round(x % 60);
        x /= 60;
        let minutes = Math.round(x % 60);
        x /= 60;
        let hours = Math.round(x % 24);
        x /= 24;
        let days = Math.round(x);

        return { "d": days, "h": hours, "m": minutes, "s": seconds };
    }


}