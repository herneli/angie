import React, { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import { Route, Switch } from "react-router";
import { Link, useRouteMatch } from "react-router-dom";
import T from "i18n-react";
import ModelAdmin from "../../configuration/ModelAdmin";
import axios from "axios";
import { createUseStyles } from "react-jss";
import PackageContextProvider from "../../../components/packages/PackageContext";
import Integration from "../integration/Integration";
import Integrations from "../integration/Integrations";
import Message from "../message/Message";
import ModelEdit from "../../configuration/ModelEdit";

const { Sider, Content, Header } = Layout;

const useStyles = createUseStyles({
    header: {
        backgroundColor: "white",
        height: 40,
        lineHeight: "40px",
    },
});

export default function Package({ match }) {
    const [currentPackage, setCurrentPackage] = useState();
    const classes = useStyles();
    useEffect(() => {
        axios
            .get("/packages/" + match.params.packageCode + "/versions/" + match.params.packageVersion)
            .then((response) => {
                setCurrentPackage(response.data.data);
            });
    }, [match]);

    let { path, url } = useRouteMatch();

    if (!currentPackage) {
        return "Loading";
    }
    const dependiencies = [[currentPackage.code, currentPackage.version], ...(currentPackage.dependencies || [])];
    return (
        <PackageContextProvider currentPackage={currentPackage} dependencies={dependiencies}>
            <Layout>
                <Header className={classes.header}>
                    {currentPackage.name} ({currentPackage.code}/{currentPackage.version})
                </Header>
                <Layout>
                    <Sider width={200} className="adm-submenu">
                        <Menu mode="inline" style={{ height: "100%", borderRight: 0 }}>
                            <Menu.Item key="integrations">
                                <Link to={url + "/integrations"}>{T.translate("packages.integrations")}</Link>
                            </Menu.Item>
                            <Menu.Item key="camel_components">
                                <Link to={url + "/camel_component"}>{T.translate("packages.camel_components")}</Link>
                            </Menu.Item>
                            <Menu.Item key="node_types">
                                <Link to={url + "/node_type"}>{T.translate("packages.node_types")}</Link>
                            </Menu.Item>
                            <Menu.Item key="contexts">
                                <Link to={url + "/script_context"}>{T.translate("packages.contexts")}</Link>
                            </Menu.Item>
                            <Menu.Item key="objects">
                                <Link to={url + "/script_object"}>{T.translate("packages.objects")}</Link>
                            </Menu.Item>
                            <Menu.Item key="methods">
                                <Link to={url + "/script_method"}>{T.translate("packages.methods")}</Link>
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Content>
                        <Switch>
                            <Route exact path={path}>
                                Seleccione una opción
                            </Route>

                            <Route
                                exact
                                path={path + "/integrations"}
                                render={({ match }) => <Integrations match={match} />}
                            />
                            <Route
                                exact
                                path={path + "/integrations/:id"}
                                render={({ match }) => <Integration match={match} />}
                            />
                            <Route
                                exact
                                path={path + "/integrations/:id/:channel"}
                                render={({ match }) => <Integration match={match} />}
                            />
                            <Route
                                exact
                                path={path + "/messages/:channel_id"}
                                render={({ match }) => <Message match={match} packageUrl={url} />}
                            />
                            <Route
                                exact
                                path={path + "/:model"}
                                render={({ match }) => {
                                    return <ModelAdmin model={match.params.model} />;
                                }}
                            />
                            <Route
                                exact
                                path={path + "/:model/:id"}
                                render={({ match }) => {
                                    return <ModelEdit model={match.params.model} />;
                                }}
                            />
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        </PackageContextProvider>
    );
}
