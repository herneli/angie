import React from 'react';
import axios from 'axios';
import URL from 'url-parse';
import Config from './Config'


export default class AxiosConfig {

    /**
     * Metodo extraido de un comentario de aqui: 
     * https://stackoverflow.com/questions/52702466/detect-react-reactdom-development-production-build
     */
    static reactIsInDevelomentMode() {
        return '_self' in React.createElement('div');
    }

    static getContextPath() {
        return window.location.pathname.substring(0, window.location.pathname.indexOf("/", 2));
    }
    /**
     * Se encarga de configurar el interceptor para los errores en las llamadas AJAX realizadas
     */
    static configureAxios(app) {
        let myUrl = new URL(window.location.href);
        axios.defaults.baseURL = myUrl.protocol + "//" + myUrl.hostname + ':' + myUrl.port + AxiosConfig.getContextPath() + "/";
        axios.defaults.headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('tokenJWT') ? 'Bearer ' + localStorage.getItem('tokenJWT') : ''
        }

        if (AxiosConfig.reactIsInDevelomentMode()) {
            axios.defaults.baseURL = Config.getServerURLDevelopment();
        }
        // Add a request interceptor
        axios.interceptors.response.use(function (response) {
            switch (response.data.status) {

                case 403:
                    if (app) {
                        app.unauthorized();
                    }
                    break;
                default:
                    break;
            }
            // Do something before request is sent
            return response;
        }, function (error) {
            switch (error.response.data.status) {
                case 403:
                    if (app) {
                        app.unauthorized();
                    }
                    break;
                default:
                    break;
            }
            return Promise.reject(error);
        });
    }
}