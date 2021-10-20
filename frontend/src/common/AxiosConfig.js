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

    /**
     * Permite establecer el context path de una api a nivel global
     * @returns 
     */
    static getContextPath() {
        return "";
    }


    /**
     * Recarga la cabecera de autorización con el token guardado.
     */
    static reloadToken(){
        axios.defaults.headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('tokenJWT') ? 'Bearer ' + localStorage.getItem('tokenJWT') : ''
        }
    }
    
    /**
     * Se encarga de configurar el interceptor para los errores en las llamadas AJAX realizadas
     */
    static configureAxios() {
        let myUrl = new URL(window.location.href);
        axios.defaults.baseURL = myUrl.protocol + "//" + myUrl.hostname + ':' + myUrl.port + AxiosConfig.getContextPath() + "/";

        //Establece el token como header
        AxiosConfig.reloadToken();

        if (AxiosConfig.reactIsInDevelomentMode()) {
            axios.defaults.baseURL = Config.getServerURLDevelopment();
        }
        // Add a request interceptor
        axios.interceptors.response.use(function (response) {
            switch (response.data.status) {
                case 500:
                    console.error(response?.data?.message);
                    break;
                default:
                    break;
            }
            // Do something before request is sent
            return response;
        }, function (error) {
            if (error.response && error.response.data) {
                switch (error.response.data.status) {
                    case 500:
                        console.error(error);
                        break;
                    default:
                        break;
                }
            }
            return Promise.reject(error);
        });
    }
}