import "./App.less";
import { withRouter } from "react-router-dom";
import AppMain from "./layout/AppMain";
import React, { Component } from "react";
import AxiosConfig from "./common/AxiosConfig";
import Config from "./common/Config";
import TranslationLoader from "./common/TranslationLoader";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import AppMenu from "./layout/AppMenu";

import configureKeycloak from "./configureKeycloak";
import { Layout } from "antd";
import { Content } from "antd/lib/layout/layout";
class App extends Component {
    state = {
        loaded: false,
    };

    /**
     * Inicializa los parametros de la aplicacion y la marca como 'cargada'
     * @param {*} props
     */
    constructor(props) {
        super(props);

        AxiosConfig.configureAxios();
    }

    async componentDidMount() {
        await Config.loadConfigParams(true);
        this.keycloak = await configureKeycloak();
        await TranslationLoader.loadTranslations();
        this.setState({
            loaded: true,
        });
    }

    eventLogger = (event, error) => {
        if (event === "onReady") {
            this.setState({
                loaded: true,
            });
        }
        console.log("onKeycloakEvent", event, error);
    };

    tokenLogger = (tokens) => {
        console.log("onKeycloakTokens", tokens);
        localStorage.setItem("tokenJWT", tokens.token);
    };

    render() {
        const { loaded } = this.state;
        return (
            <div>
                {loaded && (
                    <ReactKeycloakProvider
                        authClient={this.keycloak}
                        onEvent={this.eventLogger}
                        onTokens={this.tokenLogger}
                        initOptions={{ checkLoginIframe: false }}
                    >
                        {/* initOptions={{ onLoad: 'login-required' }} */}
                        <Layout className="App">
                            <AppMenu />
                            <AppMain app={this} />
                        </Layout>
                    </ReactKeycloakProvider>
                )}
            </div>
        );
    }
}

export default withRouter(App);
