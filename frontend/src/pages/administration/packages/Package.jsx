import React, { useEffect, useState } from "react";
import { Button, Layout, Tag } from "antd";
import { Route, Switch } from "react-router";
import { useRouteMatch } from "react-router-dom";
import T from "i18n-react";
import ModelAdmin from "../../configuration/ModelAdmin";
import axios from "axios";
import { createUseStyles } from "react-jss";
import PackageContextProvider from "../../../providers/packages/PackageContext";
import Integration from "../integration/Integration";
import Integrations from "../integration/Integrations";
import ModelEdit from "../../configuration/ModelEdit";
import SubMenu from "../../../layout/SubMenu";
import NodeTypeEdit from "../nodeType/NodeTypeEdit";
import Text from "antd/lib/typography/Text";
import { LeftOutlined } from "@ant-design/icons";
import { PrivateRoute } from "../../../components/security/PrivateRoute";
import Packages from "./Packages";
import { useHistory } from "react-router-dom";

const { Content, Header } = Layout;

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
    const history = useHistory();

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
                <Header className={classes.header} style={{ backgroundColor: "#deefff"}}>
                    <Button type="primary" onClick={(e) => history.goBack()} icon={<LeftOutlined />} size={"small"} style={{height: 22}}/>
                    <Tag color={"geekblue"}>{currentPackage?.packageData?.name} ({currentPackage.code}/{currentPackage.version})</Tag>
                </Header>
                <Layout>
                    <SubMenu
                        parent={"/packages"}
                        url={url}
                        packageInfo={currentPackage.code + "/versions/" + currentPackage.version + "/"}
                    />
                    <Content className="packageContent">
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
                                path={path + "/node_type/:id"}
                                render={({ match }) => {
                                    return <NodeTypeEdit model={"node_type"} />;
                                }}
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
