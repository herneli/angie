import "./App.less";
import { withRouter } from "react-router-dom";
import AppMain from "./layout/AppMain";
import React, { Component, useState, useEffect } from "react";
import AxiosConfig from "./common/AxiosConfig";
import Config from "./common/Config";
import TranslationLoader from "./common/TranslationLoader";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import AppMenu from "./layout/AppMenu";

import configureKeycloak from "./configureKeycloak";
import { Layout, Spin } from "antd";
import axios from "axios";
import UserContextProvider from "./components/security/UserContext";

class App extends Component {
    state = {
        loaded: false,
        keycloakReady: false,
        tokenLoaded: false,
        menu: null,
        allowedPaths: null,
        currentUser: null,
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
        await Config.loadConfigParams();
        this.keycloak = await configureKeycloak();
        await TranslationLoader.loadTranslations();

        this.setState({
            loaded: true,
        });
    }

    eventLogger = async (event, error) => {
        if (event === "onReady") {
            if (this.keycloak?.tokenParsed?.sub) {
                await this.getAllowedSections(this.keycloak.tokenParsed.sub);
                await this.getCurrentUser(this.keycloak.tokenParsed.sub);
            }

            this.setState({
                keycloakReady: true,
            });
        }
        console.log("onKeycloakEvent", event, error);
    };

    tokenLogger = (tokens) => {
        console.log("onKeycloakTokens", tokens);
        localStorage.setItem("tokenJWT", tokens.token);
        if (tokens.idToken != undefined) {
            this.setState({
                tokenLoaded: true,
            });
        }
        AxiosConfig.reloadToken();
    };

    async getAllowedSections(id) {
        try {
            const data = await axios.post(`/section/${id}/check_allowed`);

            if (data.status === 200) {
                return this.setState({
                    menu: data.data.menu,
                    allowedPaths: data.data.allowedPaths,
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    async getCurrentUser(id) {
        try {
            const response = await axios.get(`/configuration/model/users/data/${id}`);
            if (response.status === 200) {
                this.setState({
                    currentUser: response.data.data,
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    render() {
        const { loaded, menu, allowedPaths, keycloakReady, currentUser } = this.state;
        return (
            <div>
                {loaded && (
                    <ReactKeycloakProvider
                        authClient={this.keycloak}
                        onEvent={this.eventLogger}
                        onTokens={this.tokenLogger}
                        initOptions={{ checkLoginIframe: false }}>
                        {keycloakReady && (
                            <UserContextProvider user={currentUser} menu={menu} allowedPaths={allowedPaths}>
                                {menu && allowedPaths && (
                                    <Layout className="App">
                                        <AppMenu />
                                        <AppMain />
                                    </Layout>
                                )}
                            </UserContextProvider>
                        )}
                        {!keycloakReady && (
                            <div style={{ textAlign: "center", padding: "46vh" }}>
                                <Spin />
                            </div>
                        )}
                    </ReactKeycloakProvider>
                )}
            </div>
        );
    }
}

export default withRouter(App);
