import React from 'react';
import {
  BackHandler,
  Text,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  NetInfo,
} from 'react-native';
import _ from 'lodash/fp';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {navigateTo, resetTo} from '../actions/navigation';
import Base from './view_base';
import Home from './home';
import Player from './player';
import {deleteCurrentlyDownloadingFiles} from '../actions/data';
const {height, width} = Dimensions.get('window');
import {getSchedule, setValue} from '../actions/data';
import {setPlayerValue} from '../actions/player';
import Orientation from 'react-native-orientation';
import Chromecast from './chromecast';
import {getLiveShow} from './helper_funcs';
import {colors} from '../constants';

class App extends React.Component {
  componentWillMount() {
    NetInfo.getConnectionInfo().then(this.updateConnection);
    NetInfo.addEventListener('connectionChange', this.updateConnection);
    if (!this.props.videoMode && !this.props.liveMode) {
      Orientation.lockToPortrait();
    } else {
      Orientation.unlockAllOrientations();
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      if (!this.props.routes || this.props.routes.length <= 2) {
        return true;
      }
      this.props.navigation.goBack();
      return false;
    });
    this.props.setPlayerValue('isFullscreenVideo', false);
    this.props.getSchedule();
    this.props.setValue('gettingSchedule', true);
    this.checkLiveThread();
  }

  checkLive = () => {
    if (getLiveShow(this.props)) {
      this.props.setPlayerValue('liveNow', true);
    } else {
      this.props.setPlayerValue('liveNow', false);
    }
  };

  checkLiveThread = () => {
    this.checkLive();
    this.setInterval(() => {
      this.checkLive();
    }, 8000);
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.reduxRehydrated && nextProps.reduxRehydrated) {
      // Delete all downloads that were previously running before the
      // app was shut down.
      nextProps.deleteCurrentlyDownloadingFiles(nextProps.offlineEpisodes);
      NetInfo.getConnectionInfo().then(this.updateConnection);
      if (this.props.navigation.state.routeName !== 'episode') {
        this.props.setPlayerValue('videoMode', false);
      }
      if (this.props.navigation.state.routeName !== 'live') {
        this.props.setPlayerValue('liveMode', false);
      }
      this.props.setPlayerValue('chromecastMode', false);
    }
    if (
      nextProps.navigation.state.routeName !== 'live' &&
      nextProps.navigation.state.routeName !== 'episode'
    ) {
      this.props.setPlayerValue('isFullscreenVideo', false);
    }
    if (
      !this.props.videoMode &&
      !this.props.liveMode &&
      (nextProps.videoMode || nextProps.liveMode)
    ) {
      Orientation.unlockAllOrientations();
    } else if (
      (this.props.videoMode || this.props.liveMode) &&
      !nextProps.videoMode &&
      !nextProps.liveMode
    ) {
      Orientation.lockToPortrait();
    }
  }

  componentDidMount() {
    this.setTimeout(() => {
      if (this.loggedIn()) {
        this.props.resetTo('homescreen');
      } else {
        this.props.resetTo('login');
      }
    }, 500);
  }

  componentWillUnmount() {
    NetInfo.removeEventListener(
      'connectionChange',
      this.props.updateConnectionInfo,
    );
    BackHandler.removeEventListener('hardwareBackPress');
  }

  updateConnection = connection => {
    console.log('JG: in updateConnection, connection = ', connection);
    connection = connection.type.toLowerCase();
    let wifiRE = new RegExp(/wi|vpn|eth/i);
    if (connection.includes('mobile') || connection.includes('cell')) {
      this.props.setValue('connection', 'cell');
    } else if (wifiRE.test(connection)) {
      this.props.setValue('connection', 'wifi');
    } else {
      this.props.setValue('connection', null);
    }
  };

  loggedIn = () => {
    return (
      (this.props.user_id && this.props.user_id != 'logged_out') ||
      this.props.guest
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this.loggedIn() && <Player navigation={this.props.navigation} />}
        {this.loggedIn() && <Chromecast navigation={this.props.navigation} />}
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
    liveMode: state.player.liveMode,
    routes: state.navigation.routes,
    episodes: state.data.episodes,
    recentEpisodeIds: state.data.recentEpisodeIds,
    schedule: state.data.schedule,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      navigateTo,
      resetTo,
      setValue,
      setPlayerValue,
      getSchedule,
      deleteCurrentlyDownloadingFiles,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
ReactMixin.onClass(App, TimerMixin);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height,
    width: width,
    backgroundColor: colors.bodyBackground,
  },
});
