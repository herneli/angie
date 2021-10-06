import './App.css';


import { withRouter } from 'react-router-dom';
import AppMain from './layout/AppMain';
import React, { Component } from 'react';
import AxiosConfig from './common/AxiosConfig';
import Config from './common/Config';
import TranslationLoader from './common/TranslationLoader';


import { ReactKeycloakProvider } from '@react-keycloak/web';
import Menu from './pages/Menu';

import keycloak from './keycloak';

import axios from 'axios';
class App extends Component {

    state = {
        loaded: false
    }

    /**
     * Inicializa los parametros de la aplicacion y la marca como 'cargada'
     * @param {*} props 
     */
    constructor(props) {
        super(props);

        AxiosConfig.configureAxios(this);
        (async () => {

            let req = await axios.get('/login');
            console.log(req);
            await Config.loadConfigParams(true);
            await TranslationLoader.loadTranslations();
            this.setState({
                loaded: true
            });
        })();
    }



    /**
     * Desautoriza el usuario actual
     */
    unauthorized = () => {
        this.setState({
            isAuthenticated: false
        })
    }
    eventLogger = (event, error) => {
        if (event === 'onReady') {
            this.setState({
                loaded: true
            })
        }
        console.log('onKeycloakEvent', event, error)
    }

    tokenLogger = (tokens) => {
        console.log('onKeycloakTokens', tokens)
        localStorage.setItem('tokenJWT', tokens.token);
    }

    render() {
        const { loaded } = this.state;
        return (
            <ReactKeycloakProvider authClient={keycloak} onEvent={this.eventLogger} onTokens={this.tokenLogger} >
                {/* initOptions={{ onLoad: 'login-required' }} */}
                {loaded && <div className="App">
                    <div style={{ height: '99vh' }}>
                        <Menu />
                        <AppMain app={this} />
                    </div>
                </div>}
            </ReactKeycloakProvider >
        );
    }
}

export default withRouter(App);
