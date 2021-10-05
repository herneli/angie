import './App.css';


import { withRouter } from 'react-router-dom';
import AppMain from './layout/AppMain';
import React, { Component } from 'react';
import AxiosConfig from './common/AxiosConfig';
import Config from './common/Config';
import TranslationLoader from './common/TranslationLoader';
import UserHandler from './common/UserHandler';

class App extends Component {

    state = {
        loaded: true,
        isAuthenticated: true
    }

    /**
     * Inicializa los parametros de la aplicacion y la marca como 'cargada'
     * @param {*} props 
     */
    constructor(props) {
        super(props);

        AxiosConfig.configureAxios(this);
        // (async () => {
        //     await Config.loadConfigParams(true);
        //     await TranslationLoader.loadTranslations();
        //     this.setState({
        //         loaded: true,
        //         isAuthenticated: UserHandler.isAuthenticated()
        //     });
        // })();
    }

    /**
     * Desautoriza el usuario actual
     */
    unauthorized = () => {
        this.setState({
            isAuthenticated: false
        })
    }


    render() {
        const { loaded } = this.state;

        return (
            <div className="App">
                <div style={{ height: '99vh' }}>
                    {loaded && <AppMain app={this} />}
                </div>
            </div>
        );
    }
}

export default withRouter(App);
