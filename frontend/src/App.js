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
import { Layout, Spin } from "antd";
import axios from "axios";
import UserContextProvider from "./providers/security/UserContext";

import * as api from "./api/configurationApi";

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
                await this.loadUserInfo(this.keycloak.tokenParsed.sub);
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

    loadUserInfo = async (id) => {
        try {
            const user = await api.getModelData("users", id);
            const menuResponse = await axios.post(`/section/${id}/check_allowed`);

            return this.setState({
                currentUser: user,
                menu: menuResponse?.data?.menu || [],
                allowedPaths: menuResponse?.data?.allowedPaths || [],
            });
        } catch (e) {
            console.error(e);
        }
    };

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
                                <Layout className="App">
                                    <AppMenu app={this} />
                                    <AppMain />
                                </Layout>
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
