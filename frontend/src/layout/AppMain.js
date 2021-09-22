import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from "react-router-dom";
import UserHandler from '../common/UserHandler';

import DnDFlow from '../drag/DnDFlow';
import Menu from '../menu/Menu';

/**
 * Contenido principal.
 *
 * Aqui es necesario agregar todas las vistas principales posibles!
 */
class AppMain extends Component {
    checkAuth(path) {
        if (UserHandler.getUser() && UserHandler.getUser().login === 'admin') {//Force admin user
            return true;
        }
        //TODO filtrar los accesos en base a las secciones del usuario.
        return false;
    }


    render() {
        const defaultProps = {
            app: this.props.app
        };



        return (
            <Switch>
                <Route exact path='/' render={({ match }) => <Menu match={match} {...defaultProps} />} />
                <Route exact path='/drag' render={({ match }) => <DnDFlow match={match} {...defaultProps} />} />
                

                {/* Rutas publicas */}
                {/* <Route exact path='/403' render={({ match }) => <Unauthorized match={match} {...defaultProps} />} /> */}

                {/* Rutas privadas */}
                {/* <PrivateRoute exact path='/users' authed={this.checkAuth('/users')} redirectTo='/403' {...defaultProps} component={UsersList} /> */}
                
            </Switch>
        );
    }
}

export default withRouter(AppMain);
