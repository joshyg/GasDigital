import React, {Component} from 'react';
import {Navigator, BackHandler, NativeModules, AppRegistry, Text, StyleSheet, View} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addNavigationHelpers, StackNavigator } from 'react-navigation';
import { AppNavigator } from '../reducers/navigation';

class AppWithNavigationState extends Component {

    
    render(){
        return (
            <AppNavigator navigation={
                    addNavigationHelpers({
                        dispatch: this.props.dispatch,
                        state: this.props.navigationState,
                    })} />
        );
    }
}

function mapStateToProps(state) {
    return {
        navigationState: state.navigation,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps)(AppWithNavigationState);

