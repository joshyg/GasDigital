import React from 'react';
import {BackHandler, Text, StyleSheet, View, Dimensions, TouchableOpacity, Image, StatusBar, NetInfo } from 'react-native';
import _ from 'lodash/fp';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { navigateTo, resetTo } from '../actions/navigation';
import Base  from './view_base';
import Home from './home';
import Player from './player';
import { 
    deleteCurrentlyDownloadingFiles,
} from '../actions/data';
const { height, width } = Dimensions.get('window');
import { setValue } from '../actions/data';
import { setPlayerValue } from '../actions/player';
import Orientation from 'react-native-orientation';


class App extends React.Component {
    componentWillMount() {
        NetInfo.getConnectionInfo().then(this.updateConnection);
        NetInfo.addEventListener('connectionChange', this.updateConnection);
        if ( ! this.props.videoMode ) {
          Orientation.lockToPortrait();
        } else {
          Orientation.unlockAllOrientations();
        }

        BackHandler.addEventListener('hardwareBackPress', () => {
          if ( !this.props.routes || this.props.routes.length <= 2 ) {
            return true;
          }
          this.props.navigation.goBack();
          return false;
        });
    }

    componentWillReceiveProps(nextProps) { 
        if (!this.props.reduxRehydrated && nextProps.reduxRehydrated) {
            // Delete all downloads that were previously running before the 
            // app was shut down.
            nextProps.deleteCurrentlyDownloadingFiles(nextProps.offlineEpisodes);            
            NetInfo.getConnectionInfo().then(this.updateConnection);
            if ( this.props.navigation.state.routeName !== 'episode' ) {
              this.props.setPlayerValue('videoMode', false);
            }
        }
        if ( ! this.props.videoMode && nextProps.videoMode ) {
          Orientation.unlockAllOrientations();
        } else if ( this.props.videoMode && ! nextProps.videoMode ) {
          Orientation.lockToPortrait();
        }
    }

    componentDidMount() {
        this.setTimeout(()=>{
            if(this.loggedIn()){
                this.props.resetTo('homescreen');
            }else{
                console.log("JG: reset to login");
                this.props.resetTo('login');
            }
        },500)
    }

    componentWillUnmount() {
      NetInfo.removeEventListener('connectionChange', this.props.updateConnectionInfo);
      BackHandler.removeEventListener('hardwareBackPress');
    }

    updateConnection = (connection) => {
      console.log('JG: in updateConnection, connection = ', connection );
      connection = connection.type.toLowerCase();
      let wifiRE = new RegExp(/wi|vpn|eth/i)
      if ( connection.includes('mobile') || connection.includes('cell') ) {
        this.props.setValue('connection', 'cell');
      } else if ( wifiRE.test(connection) ) {
        this.props.setValue('connection', 'wifi');
      } else {
        this.props.setValue('connection', null);
      }
    }


    loggedIn = () => {
      return this.props.user_id && this.props.user_id != 'logged_out' || this.props.guest;
    }

    render() {
        return (
            <View style={styles.container}>
                { this.loggedIn() && <Player navigation={this.props.navigation}/> }
            </View>
        );
    }
}

function mapStateToProps(state) {
  return {
    user_id: state.auth.user_id,
    guest: state.auth.guest,
    reduxRehydrated: state.storage.loaded,
    offlineEpisodes: state.data.offlineEpisodes,
    videoMode: state.player.videoMode,
    routes: state.navigation.routes,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    navigateTo,
    resetTo,
    setValue,
    setPlayerValue,
    deleteCurrentlyDownloadingFiles
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
ReactMixin.onClass(App, TimerMixin);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height,
    width: width,
  },
});
