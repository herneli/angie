import React, { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import { Route, Switch } from "react-router";
import { Link, useRouteMatch } from "react-router-dom";
import T from "i18n-react";
import ModelAdmin from "../../configuration/ModelAdmin";
import axios from "axios";
import { createUseStyles } from "react-jss";
import PackageContextProvider from "../../../components/packages/PackageContext";
const { Sider, Content, Header } = Layout;

const useStyles = createUseStyles({
    header: {
        backgroundColor: "white",
    },
});

export default function Package({ match }) {
    const [currentPackage, setCurrentPackage] = useState();
    const classes = useStyles();
    useEffect(() => {
        axios.get("/packages/" + match.params.packageId).then((response) => {
            setCurrentPackage(response.data.data[0]);
        });
    }, [match]);

    let { path, url } = useRouteMatch();

    if (!currentPackage) {
        return "Loading";
    }
    return (
        <PackageContextProvider
            currentPackage={currentPackage}
            dependencies={[[currentPackage.code, currentPackage.version]]}>
            <Layout>
                <Header className={classes.header}>
                    {currentPackage.name} ({currentPackage.code}/{currentPackage.version})
                </Header>
                <Layout>
                    <Sider width={200} className="adm-submenu">
                        <Menu mode="inline" style={{ height: "100%", borderRight: 0 }}>
                            <Menu.Item key="contexts">
                                <Link to={url + "/contexts"}>{T.translate("packages.contexts")}</Link>
                            </Menu.Item>
                            <Menu.Item key="objects">
                                <Link to={url + "/objects"}>{T.translate("packages.objects")}</Link>
                            </Menu.Item>
                            <Menu.Item key="methods">
                                <Link to={url + "/methods"}>{T.translate("packages.methods")}</Link>
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Content>
                        <Switch>
                            <Route exact path={path}>
                                Seleccione una opción
                            </Route>
                            <Route path={path + "/methods"} component={() => <ModelAdmin model="script_method" />} />
                            <Route path={path + "/objects"} component={() => <ModelAdmin model="script_object" />} />
                            <Route path={path + "/contexts"} component={() => <ModelAdmin model="script_context" />} />
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        </PackageContextProvider>
    );
}
