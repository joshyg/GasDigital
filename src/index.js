import React, {Component} from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import store from './store';
import Nav from './containers/navigator';

export default class GasDigital extends Component {
    render() {
        return (
            <Provider store={store}>
                <Nav />
            </Provider>
        );
    }
}
