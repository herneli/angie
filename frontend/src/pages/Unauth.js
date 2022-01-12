import React from 'react';
import { Layout } from 'antd';


const { Content } = Layout;
const Unauth = () => {

    return (
        <Content>
            <h1>Not Authorized</h1>

            <strong>You cannot access this page</strong>

        </Content>
    )
}
export default Unauth