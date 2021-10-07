import axios from 'axios';
import lodash from 'lodash';

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

    static getViewContextPath() {
        return "/front";
    }

    static getCurrentLang() {
        let current = Config.getAppDefaultLang();

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


    static getKeycloakConfig() {
        if (!this.configParams || this.configParams.length <= 0) {
            this.loadConfigParams();
        }
        return {
            url: this.configParams['core.keycloak.url'],
            realm: this.configParams['core.keycloak.realm'],
            clientId: this.configParams['core.keycloak.front-client']
        }
    }


}