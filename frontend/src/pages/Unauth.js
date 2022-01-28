import React from "react";
import { Layout } from "antd";
import { useKeycloak } from "@react-keycloak/web";
import { Redirect } from "react-router";

const { Content } = Layout;
const Unauth = () => {
    const { keycloak } = useKeycloak();

    if (keycloak.authenticated) {
        return <Redirect to={{ pathname: "/" }} />;
    }

    return (
        <Content>
            <h1>Not Authorized</h1>

            <strong>You cannot access this page</strong>
        </Content>
    );
};
export default Unauth;
