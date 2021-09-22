import React from 'react'
import { Route, Redirect } from 'react-router-dom'

const renderMergedProps = (component, ...rest) => {
    const theProps = Object.assign({}, ...rest);
    return React.createElement(component, theProps);
};


const PrivateRoute = ({ component, authed = false, redirectTo, ...rest }) => {
    return (
        <Route {...rest} render={ routeProps => {
            return authed ? (
                renderMergedProps(component, routeProps, rest)
            ) : (
                <Redirect push to={{
                    pathname: redirectTo,
                    state: { from: routeProps.location }
                }}/>
            );
        }}/>
    );
};

export default PrivateRoute;